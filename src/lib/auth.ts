import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

const COOKIE = 'eventhub_session';
const SECRET = process.env.AUTH_SECRET ?? 'eventhub-local-development-secret';
const sign = (value: string) => createHmac('sha256', SECRET).update(value).digest('hex');
const tokenFor = (userId: number) => `${userId}.${sign(String(userId))}`;
export type SessionUser = { id: number; name: string; email: string; role: 'customer' | 'admin' };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [id, signature] = token.split('.');
  if (!id || !signature) return null;
  const expected = sign(id);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  const user = db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, Number(id)))
    .get();
  return user ?? null;
}

export async function setSession(userId: number) {
  (await cookies()).set(COOKIE, tokenFor(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 14,
    path: '/',
  });
}
export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}
