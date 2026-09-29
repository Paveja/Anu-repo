'use client';
import { useEffect, useState } from 'react';
import { EventCard, PageFrame, type EventCardData } from '@/components/site';
const cats = ['', 'music', 'sports', 'technology', 'business', 'food', 'arts', 'entertainment'];
export default function Explore() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('date');
  const load = () =>
    fetch(`/api/events?q=${encodeURIComponent(q)}&category=${category}&sort=${sort}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  useEffect(() => {
    void load();
  }, [category, sort]);
  return (
    <PageFrame>
      <main>
        <div style={{ padding: '55px 0 20px' }}>
          <div className="eyebrow">The good stuff</div>
          <h1 style={{ fontSize: 52, letterSpacing: '-.07em', margin: '0 0 10px' }}>
            Explore events
          </h1>
          <p className="muted">Find something that feels like you.</p>
        </div>
        <div className="filters">
          <input
            className="input"
            placeholder="Search by name or place"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All categories'}
              </option>
            ))}
          </select>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Soonest</option>
            <option value="price">Lowest price</option>
          </select>
          <button className="btn btn-purple" onClick={load}>
            Search
          </button>
        </div>
        {events.length ? (
          <div className="grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No events match that search.</h3>
            <p className="muted">Try a different category or search term.</p>
          </div>
        )}
      </main>
    </PageFrame>
  );
}
