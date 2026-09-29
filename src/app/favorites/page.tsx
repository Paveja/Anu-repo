'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default function Favorites() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([fetch('/api/favorites'), fetch('/api/events')]).then(async ([a, b]) => {
      const fa = await a.json(),
        ev = await b.json();
      if (!a.ok) return setError(fa.error);
      setItems(
        (ev.events ?? []).filter((e: any) => fa.favorites.some((f: any) => f.eventId === e.id))
      );
    });
  }, []);
  return (
    <PageFrame>
      <main style={{ padding: '55px 0' }}>
        <div className="eyebrow">Saved for later</div>
        <h1 style={{ fontSize: 52, letterSpacing: '-.07em' }}>Favorites</h1>
        {error ? (
          <div className="empty">
            <h3>{error}</h3>
            <Link className="btn btn-primary" href="/login">
              Sign in
            </Link>
          </div>
        ) : items.length ? (
          <div className="grid">
            {items.map((e) => (
              <article className="card" key={e.id}>
                <Link href={`/events/${e.id}`}>
                  <div
                    className="event-card-image"
                    style={{ backgroundImage: `url(${e.imageUrl})` }}
                  />
                  <div className="card-body">
                    <h3>{e.title}</h3>
                    <p className="muted">
                      {e.venue} · {e.city}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No favorites yet.</h3>
            <p className="muted">Tap the heart on events you want to remember.</p>
          </div>
        )}
      </main>
    </PageFrame>
  );
}
