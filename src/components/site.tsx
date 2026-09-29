'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Nav() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);
  const links = [
    { href: '/explore', label: 'Explore', icon: '⌕' },
    { href: '/tickets', label: 'Tickets', icon: '▣' },
    { href: '/favorites', label: 'Saved', icon: '♡' },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: '◆' }] : []),
  ];
  return (
    <header className="nav">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        event<span>hub</span>
      </Link>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span /> <span />
      </button>
      <nav className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        {links.map((link) => (
          <Link
            className={pathname.startsWith(link.href) ? 'nav-link-active' : ''}
            href={link.href}
            key={link.href}
            onClick={() => setOpen(false)}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        {user ? (
          <Link className="profile-chip" href="/profile" aria-label="Open profile">
            <span>{user.name.slice(0, 1).toUpperCase()}</span>
            <b>{user.name.split(' ')[0]}</b>
          </Link>
        ) : (
          <Link className="btn btn-primary" href="/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      © 2026 EventHub <span>·</span> Find your next great night.
    </footer>
  );
}
export type EventCardData = {
  id: number;
  title: string;
  featured?: boolean;
  imageUrl: string;
  city: string;
  venue: string;
  startsAt: string | Date;
  category: string;
  tickets: { price: number; capacity: number; sold: number }[];
};
export function EventCard({ event }: { event: EventCardData }) {
  const [favorited, setFavorited] = useState(false);
  const price = Math.min(...event.tickets.map((t) => t.price));
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventId: event.id }),
    });
    if (response.ok) setFavorited((value) => !value);
  };
  return (
    <article className="card">
      <Link href={`/events/${event.id}`}>
        <div className="event-card-image" style={{ backgroundImage: `url(${event.imageUrl})` }}>
          <span className="category-pill">{event.category}</span>
          <button className="heart" aria-label="Favorite event" onClick={toggleFavorite}>
            {favorited ? '♥' : '♡'}
          </button>
        </div>
        <div className="card-body">
          <h3>{event.title}</h3>
          <div className="event-meta">
            <span>◷</span>
            {new Date(event.startsAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            <span className="meta-dot">·</span>
            {new Date(event.startsAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
          <div className="event-meta">
            <span>⌖</span>
            {event.venue}, {event.city}
          </div>
          <div className="card-footer">
            <div className="price">From ${price}</div>
            <span className="card-arrow">↗</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-shell">
        <Nav />
        {children}
        <Footer />
      </div>
    </>
  );
}
