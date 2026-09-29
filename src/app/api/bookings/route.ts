import { and, eq, gt, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import {
  bookingItems,
  bookings,
  eventSeats,
  events,
  seatHolds,
  ticketTypes,
  tickets,
} from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

const bookingSchema = z.object({
  eventId: z.number().int().positive(),
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  seatIds: z.array(z.number().int().positive()).optional(),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z.string().email(),
  payment: z.enum(['success', 'failure']),
});
const code = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const rows = db
    .select({ booking: bookings, event: events, item: bookingItems })
    .from(bookings)
    .innerJoin(events, eq(bookings.eventId, events.id))
    .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
    .where(eq(bookings.userId, user.id))
    .all();
  return NextResponse.json({ bookings: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Check your attendee details and ticket quantity.' },
      { status: 400 }
    );
  if (parsed.data.payment === 'failure') {
    if (parsed.data.seatIds?.length)
      db.delete(seatHolds)
        .where(and(eq(seatHolds.userId, user.id), inArray(seatHolds.seatId, parsed.data.seatIds)))
        .run();
    return NextResponse.json(
      { error: 'Payment simulation failed. No booking was created.' },
      { status: 402 }
    );
  }
  const ticket = db
    .select()
    .from(ticketTypes)
    .where(
      and(
        eq(ticketTypes.id, parsed.data.ticketTypeId),
        eq(ticketTypes.eventId, parsed.data.eventId)
      )
    )
    .get();
  const event = db.select().from(events).where(eq(events.id, parsed.data.eventId)).get();
  if (!ticket || !event || event.status !== 'published' || event.startsAt < new Date())
    return NextResponse.json({ error: 'This event is no longer available.' }, { status: 400 });
  const seatIds = parsed.data.seatIds ?? [];
  const seats = seatIds.length
    ? db
        .select({ seat: eventSeats, hold: seatHolds })
        .from(eventSeats)
        .innerJoin(seatHolds, eq(seatHolds.seatId, eventSeats.id))
        .where(
          and(
            eq(eventSeats.eventId, event.id),
            eq(seatHolds.userId, user.id),
            gt(seatHolds.expiresAt, new Date()),
            inArray(eventSeats.id, seatIds)
          )
        )
        .all()
    : [];
  if (
    seatIds.length &&
    (seats.length !== seatIds.length ||
      seatIds.length !== parsed.data.quantity ||
      seats.some(({ seat }) => seat.ticketTypeId !== ticket.id || seat.status !== 'available'))
  )
    return NextResponse.json(
      { error: 'Your seat hold expired. Please choose your seats again.' },
      { status: 409 }
    );
  if (!seatIds.length && ticket.capacity - ticket.sold < parsed.data.quantity)
    return NextResponse.json({ error: 'That quantity is no longer available.' }, { status: 409 });
  const subtotal = ticket.price * parsed.data.quantity;
  const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + serviceFee;
  const result = db.transaction((tx) => {
    if (!seatIds.length) {
      const inventoryUpdate = tx
        .update(ticketTypes)
        .set({ sold: ticket.sold + parsed.data.quantity })
        .where(and(eq(ticketTypes.id, ticket.id), eq(ticketTypes.sold, ticket.sold)))
        .run();
      if (inventoryUpdate.changes !== 1) throw new Error('INVENTORY_CHANGED');
    }
    const booking = tx
      .insert(bookings)
      .values({
        userId: user.id,
        eventId: event.id,
        bookingCode: code('EHB'),
        attendeeName: parsed.data.attendeeName,
        attendeeEmail: parsed.data.attendeeEmail,
        paymentStatus: 'paid',
        subtotal,
        serviceFee,
        total,
        createdAt: new Date(),
      })
      .returning()
      .get();
    if (seatIds.length) {
      for (const { seat } of seats) {
        tx.update(eventSeats).set({ status: 'sold' }).where(eq(eventSeats.id, seat.id)).run();
        tx.delete(seatHolds).where(eq(seatHolds.seatId, seat.id)).run();
        const item = tx
          .insert(bookingItems)
          .values({
            bookingId: booking.id,
            seatId: seat.id,
            seatLabel: seat.label,
            ticketTypeId: ticket.id,
            ticketTypeName: ticket.name,
            quantity: 1,
            unitPrice: ticket.price,
          })
          .returning()
          .get();
        tx.insert(tickets)
          .values({
            bookingId: booking.id,
            bookingItemId: item.id,
            seatId: seat.id,
            seatLabel: seat.label,
            ticketCode: code('TKT'),
          })
          .run();
      }
    } else {
      const item = tx
        .insert(bookingItems)
        .values({
          bookingId: booking.id,
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          quantity: parsed.data.quantity,
          unitPrice: ticket.price,
        })
        .returning()
        .get();
      for (let i = 0; i < parsed.data.quantity; i++)
        tx.insert(tickets)
          .values({ bookingId: booking.id, bookingItemId: item.id, ticketCode: code('TKT') })
          .run();
    }
    return booking;
  });
  return NextResponse.json({ booking: result }, { status: 201 });
}
