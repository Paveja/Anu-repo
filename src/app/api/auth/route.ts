import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { clearSession, getCurrentUser, setSession } from '@/lib/auth';
const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
const signup = credentials.extend({ name: z.string().trim().min(2).max(80) });
export async function GET() {
  return NextResponse.json({ user: await getCurrentUser() });
}
export async function POST(request: Request) {
  const action = request.headers.get('x-auth-action');
  if (action === 'logout') {
    await clearSession();
    return NextResponse.json({ ok: true });
  }
  const body = await request.json().catch(() => null);
  const parsed = (action === 'signup' ? signup : credentials).safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Please provide valid details.' }, { status: 400 });
  if (action === 'signup') {
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email.toLowerCase()))
      .get();
    if (existing)
      return NextResponse.json(
        { error: 'An account with that email already exists.' },
        { status: 409 }
      );
    const user = db
      .insert(users)
      .values({
        name: (parsed.data as z.infer<typeof signup>).name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        role: 'customer',
        createdAt: new Date(),
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role })
      .get();
    await setSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  }
  const user = db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .get();
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash)))
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  await setSession(user.id);
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
