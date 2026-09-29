import { and, asc, eq, like, or, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, eventSeats, events, ticketTypes } from '@/db/schema';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  const category = url.searchParams.get('category');
  const city = url.searchParams.get('city');
  const sort = url.searchParams.get('sort') ?? 'date';
  const conditions = [eq(events.status, 'published')];
  if (q)
    conditions.push(
      or(
        like(events.title, `%${q}%`),
        like(events.description, `%${q}%`),
        like(events.venue, `%${q}%`)
      )!
    );
  if (category) conditions.push(eq(categories.slug, category));
  if (city) conditions.push(eq(events.city, city));
  const rows = db
    .select({ event: events, category: categories.name })
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(
      sort === 'price'
        ? asc(
            sql`(select min(${ticketTypes.price}) from ${ticketTypes} where ${ticketTypes.eventId} = ${events.id})`
          )
        : asc(events.startsAt)
    )
    .all();
  const payload = rows.map(({ event, category }) => ({
    ...event,
    category,
    tickets: db.select().from(ticketTypes).where(eq(ticketTypes.eventId, event.id)).all(),
    seats: db.select().from(eventSeats).where(eq(eventSeats.eventId, event.id)).all(),
  }));
  return NextResponse.json({ events: payload });
}
