import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    db.delete(events)
      .where(eq(events.id, Number(id)))
      .run();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const updated = db
      .update(events)
      .set({
        title: body.title,
        description: body.description,
        venue: body.venue,
        address: body.address,
        city: body.city,
        status: body.status,
      })
      .where(eq(events.id, Number(id)))
      .returning()
      .get();
    return NextResponse.json({ event: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update event.' }, { status: 400 });
  }
}
