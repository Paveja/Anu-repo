'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default function Tickets() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/bookings').then(async (r) => {
      const d = await r.json();
      if (!r.ok) setError(d.error);
      else setData(d.bookings ?? []);
    });
  }, []);
  return (
    <PageFrame>
      <main style={{ padding: '55px 0' }}>
        <div className="eyebrow">Your plans</div>
        <h1 style={{ fontSize: 52, letterSpacing: '-.07em' }}>My tickets</h1>
        {error ? (
          <div className="empty">
            <h3>{error}</h3>
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        ) : data.length ? (
          <div className="grid">
            {data.map((row) => (
              <article className="detail-panel" key={row.booking.id}>
                <div className="eyebrow">Confirmed booking</div>
                <h2>{row.event.title}</h2>
                <p className="muted">
                  {new Date(row.event.startsAt).toLocaleString()}
                  <br />
                  {row.event.venue}, {row.event.city}
                </p>
                <p>
                  {row.item.ticketTypeName} × {row.item.quantity}
                </p>
                <p>
                  <b>Booking ID</b>
                  <br />
                  {row.booking.bookingCode}
                </p>
                <div className="price">${row.booking.total.toFixed(2)}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Your ticket wallet is empty.</h3>
            <p className="muted">Find an event and make a night of it.</p>
            <Link className="btn btn-primary" href="/explore">
              Explore events
            </Link>
          </div>
        )}
      </main>
    </PageFrame>
  );
}
