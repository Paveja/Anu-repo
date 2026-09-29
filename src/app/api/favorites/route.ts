import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  return NextResponse.json({
    favorites: db.select().from(favorites).where(eq(favorites.userId, user.id)).all(),
  });
}
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const { eventId } = await request.json().catch(() => ({}));
  if (!Number.isInteger(eventId))
    return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  const existing = db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.eventId, eventId)))
    .get();
  if (existing) {
    db.delete(favorites).where(eq(favorites.id, existing.id)).run();
    return NextResponse.json({ favorited: false });
  }
  db.insert(favorites).values({ userId: user.id, eventId }).run();
  return NextResponse.json({ favorited: true });
}
