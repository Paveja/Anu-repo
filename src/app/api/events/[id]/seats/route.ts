import { and, eq, gt, inArray, lt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { eventSeats, seatHolds, ticketTypes } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

const holdSchema = z.object({ seatIds: z.array(z.number().int().positive()).min(1).max(10) });
const HOLD_MS = 10 * 60 * 1000;

function clearExpired() {
  db.delete(seatHolds).where(lt(seatHolds.expiresAt, new Date())).run();
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  clearExpired();
  const seats = db
    .select({ seat: eventSeats, ticket: ticketTypes })
    .from(eventSeats)
    .innerJoin(ticketTypes, eq(eventSeats.ticketTypeId, ticketTypes.id))
    .where(eq(eventSeats.eventId, Number(id)))
    .all();
  const holds = db
    .select()
    .from(seatHolds)
    .where(
      and(
        inArray(
          seatHolds.seatId,
          seats.map(({ seat }) => seat.id)
        ),
        gt(seatHolds.expiresAt, new Date())
      )
    )
    .all();
  return NextResponse.json({
    seats: seats.map(({ seat, ticket }) => ({
      ...seat,
      price: ticket.price,
      tier: ticket.name,
      heldByMe: holds.some((hold) => hold.seatId === seat.id && hold.userId === user?.id),
      held: holds.some((hold) => hold.seatId === seat.id),
    })),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to choose seats.' }, { status: 401 });
  const parsed = holdSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: 'Choose at least one seat.' }, { status: 400 });
  const { id } = await params;
  clearExpired();
  const seats = db
    .select()
    .from(eventSeats)
    .where(and(eq(eventSeats.eventId, Number(id)), inArray(eventSeats.id, parsed.data.seatIds)))
    .all();
  if (
    seats.length !== parsed.data.seatIds.length ||
    seats.some((seat) => seat.status !== 'available')
  )
    return NextResponse.json(
      { error: 'One or more seats are no longer available.' },
      { status: 409 }
    );
  const expiresAt = new Date(Date.now() + HOLD_MS);
  try {
    db.transaction((tx) => {
      for (const seatId of parsed.data.seatIds)
        tx.insert(seatHolds).values({ seatId, userId: user.id, expiresAt }).run();
    });
  } catch {
    return NextResponse.json(
      { error: 'One or more seats were just selected by another guest.' },
      { status: 409 }
    );
  }
  return NextResponse.json({ heldUntil: expiresAt.toISOString() });
}
