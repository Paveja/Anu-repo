import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <PageFrame>
      <main className="auth-wrap" style={{ maxWidth: 650 }}>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 55 }}>✦</div>
          <div className="eyebrow">Booking confirmed</div>
          <h1>Your night is on the calendar.</h1>
          <p className="muted">Your booking ID is</p>
          <h2 style={{ color: 'var(--purple)' }}>{code}</h2>
          <p>We’ve saved your ticket. You can find all the details anytime in My Tickets.</p>
          <Link className="btn btn-primary" href="/tickets">
            View my tickets
          </Link>
        </div>
      </main>
    </PageFrame>
  );
}
