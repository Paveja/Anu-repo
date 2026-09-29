'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EventCard, PageFrame, type EventCardData } from '@/components/site';

export default function Home() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);
  return (
    <PageFrame>
      <main>
        <section className="hero">
          <div className="eyebrow" style={{ color: '#fdba74' }}>
            Make plans worth remembering
          </div>
          <h1>Find your next great night.</h1>
          <p>From tiny rooms to big ideas, discover the events that make this city feel alive.</p>
          <form
            className="searchbar"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/explore?q=${encodeURIComponent(q)}`;
            }}
          >
            <input
              aria-label="Search events"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events, artists, or places"
            />
            <button className="btn btn-primary">Explore events →</button>
          </form>
        </section>
        <section>
          <div className="section-head">
            <div>
              <div className="eyebrow">Curated for you</div>
              <h2>Events with a little spark</h2>
            </div>
            <Link className="btn btn-ghost" href="/explore">
              View all events
            </Link>
          </div>
          <div className="grid">
            {events
              .filter((e) => e.featured ?? true)
              .slice(0, 3)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </section>
        <section style={{ marginTop: 70 }}>
          <div
            className="detail-panel"
            style={{
              background: 'var(--surface-raised)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="eyebrow">Your calendar called</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>
                There’s always something happening.
              </h2>
              <p className="muted">Save the events you love and keep every ticket in one place.</p>
            </div>
            <Link className="btn btn-purple" href="/signup">
              Create free account
            </Link>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
