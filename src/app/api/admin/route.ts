import { NextResponse } from 'next/server';
import { count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { bookings, events, users } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
export async function GET() {
  try {
    await requireAdmin();
    const stats = {
      events: db.select({ value: count() }).from(events).get()?.value ?? 0,
      users: db.select({ value: count() }).from(users).get()?.value ?? 0,
      bookings: db.select({ value: count() }).from(bookings).get()?.value ?? 0,
      revenue:
        db
          .select({ value: sql<number>`coalesce(sum(${bookings.total}),0)` })
          .from(bookings)
          .get()?.value ?? 0,
    };
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === 'FORBIDDEN'
            ? 'Admin access required.'
            : 'Please sign in.',
      },
      { status: 401 }
    );
  }
}
