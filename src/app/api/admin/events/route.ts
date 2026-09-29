import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { categories, events, ticketTypes } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  categoryId: z.number().int().positive(),
  venue: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  startsAt: z.string(),
  endsAt: z.string(),
  ticketName: z.string().min(2),
  price: z.number().positive(),
  capacity: z.number().int().positive(),
  imageUrl: z.string().url(),
});

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({
      events: db.select().from(events).all(),
      categories: db.select().from(categories).all(),
    });
  } catch {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = eventSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: 'Please complete every event field.' }, { status: 400 });
    const slug = `${parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const event = db.transaction((tx) => {
      const created = tx
        .insert(events)
        .values({
          ...parsed.data,
          slug,
          startsAt: new Date(parsed.data.startsAt),
          endsAt: new Date(parsed.data.endsAt),
          organizerName: 'EventHub Admin',
          organizerBio: 'EventHub community team.',
          timezone: 'America/New_York',
          status: 'published',
          featured: false,
          createdAt: new Date(),
        })
        .returning()
        .get();
      tx.insert(ticketTypes)
        .values({
          eventId: created.id,
          name: parsed.data.ticketName,
          price: parsed.data.price,
          capacity: parsed.data.capacity,
          sold: 0,
        })
        .run();
      return created;
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
}
