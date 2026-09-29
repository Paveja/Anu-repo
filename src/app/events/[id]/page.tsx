'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageFrame } from '@/components/site';

type Seat = {
  id: number;
  rowLabel: string;
  seatNumber: number;
  label: string;
  position: number;
  status: 'available' | 'sold' | 'blocked';
  ticketTypeId: number;
};
type E = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  venue: string;
  address: string;
  city: string;
  organizerName: string;
  organizerBio: string;
  startsAt: string;
  category: string;
  tickets: { id: number; name: string; price: number; capacity: number; sold: number }[];
  seats: Seat[];
};

export default function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<E | null>(null);
  const [ticket, setTicket] = useState<number>();
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    params.then((p) =>
      fetch('/api/events')
        .then((r) => r.json())
        .then((d) => setEvent(d.events.find((e: E) => e.id === Number(p.id))))
    );
  }, [params]);
  const selectedTicket = event?.tickets.find((t) => t.id === ticket) ?? event?.tickets[0];
  const seatRows = useMemo(() => {
    if (!event?.seats.length) return [];
    return [...new Set(event.seats.map((seat) => seat.rowLabel))];
  }, [event]);
  if (!event || !selectedTicket)
    return (
      <PageFrame>
        <div className="empty" style={{ marginTop: 50 }}>
          Loading event…
        </div>
      </PageFrame>
    );
  const isReserved = event.seats.length > 0;
  const chosenSeats = event.seats.filter((seat) => selectedSeats.includes(seat.id));
  const totalQuantity = isReserved ? chosenSeats.length : quantity;
  const total = selectedTicket.price * totalQuantity * 1.08;
  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;
    setSelectedSeats((current) =>
      current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [...current, seat.id]
    );
  };
  const continueToCheckout = async () => {
    setError('');
    if (isReserved && selectedSeats.length === 0)
      return setError('Choose at least one seat to continue.');
    if (isReserved) {
      setHolding(true);
      const response = await fetch(`/api/events/${event.id}/seats`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });
      const data = await response.json();
      setHolding(false);
      if (!response.ok) return setError(data.error);
      router.push(
        `/checkout?event=${event.id}&ticket=${selectedTicket.id}&qty=${selectedSeats.length}&seats=${selectedSeats.join(',')}`
      );
      return;
    }
    router.push(`/checkout?event=${event.id}&ticket=${selectedTicket.id}&qty=${quantity}`);
  };
  return (
    <PageFrame>
      <main>
        <div
          className="detail-hero"
          style={{
            backgroundImage: `linear-gradient(0deg,#241b35dd,transparent),url(${event.imageUrl})`,
          }}
        >
          <div>
            <span className="category-pill" style={{ position: 'static' }}>
              {event.category}
            </span>
            <h1>{event.title}</h1>
            <div>
              ◷{' '}
              {new Date(event.startsAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}{' '}
              · ⌖ {event.venue}, {event.city}
            </div>
          </div>
        </div>
        <div className="detail-content">
          <article>
            <div className="eyebrow">About the event</div>
            <p style={{ fontSize: 18, lineHeight: 1.7 }}>{event.description}</p>
            <div className="detail-panel" style={{ marginTop: 25 }}>
              <div className="eyebrow">Hosted by</div>
              <h3>{event.organizerName}</h3>
              <p className="muted">{event.organizerBio}</p>
              <p>
                <b>{event.venue}</b>
                <br />
                {event.address}, {event.city}
              </p>
            </div>
          </article>
          <aside className="detail-panel booking-panel">
            <div className="booking-panel-head">
              <div>
                <div className="eyebrow">
                  {isReserved ? 'Choose your seats' : 'Get your tickets'}
                </div>
                <h2>{isReserved ? `${selectedSeats.length} selected` : 'Make it yours'}</h2>
              </div>
              <span className="price">${total.toFixed(2)}</span>
            </div>
            {isReserved ? (
              <>
                <div className="stage">STAGE</div>
                <div className="seat-map" aria-label="Seat selection">
                  {seatRows.map((row) => (
                    <div className="seat-row" key={row}>
                      <span className="row-label">{row}</span>
                      {event.seats
                        .filter((seat) => seat.rowLabel === row)
                        .map((seat) => (
                          <button
                            key={seat.id}
                            className={`seat seat-${seat.status} ${selectedSeats.includes(seat.id) ? 'seat-selected' : ''}`}
                            aria-label={`${seat.label}${seat.status !== 'available' ? `, ${seat.status}` : ''}`}
                            aria-pressed={selectedSeats.includes(seat.id)}
                            disabled={seat.status !== 'available'}
                            onClick={() => toggleSeat(seat)}
                          >
                            {seat.seatNumber}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
                <div className="seat-legend">
                  <span>
                    <i className="legend-dot available" />
                    Available
                  </span>
                  <span>
                    <i className="legend-dot selected" />
                    Selected
                  </span>
                  <span>
                    <i className="legend-dot sold" />
                    Unavailable
                  </span>
                </div>
                <div className="selected-seats">
                  {chosenSeats.length ? (
                    <>
                      <b>Your seats</b>
                      <span>{chosenSeats.map((seat) => seat.label).join(' · ')}</span>
                    </>
                  ) : (
                    <span className="muted">Select seats from the map</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="tier-list">
                  {event.tickets.map((t) => (
                    <label className="ticket-option" key={t.id}>
                      <span>
                        <input
                          type="radio"
                          name="ticket"
                          checked={selectedTicket.id === t.id}
                          onChange={() => setTicket(t.id)}
                        />{' '}
                        <b>{t.name}</b>
                        <br />
                        <small className="muted">{t.capacity - t.sold} remaining</small>
                      </span>
                      <b>${t.price}</b>
                    </label>
                  ))}
                </div>
                <label className="form-stack" style={{ marginTop: 18 }}>
                  Quantity
                  <select
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from(
                      { length: Math.min(10, selectedTicket.capacity - selectedTicket.sold) },
                      (_, i) => (
                        <option key={i + 1}>{i + 1}</option>
                      )
                    )}
                  </select>
                </label>
              </>
            )}
            {error && <div className="notice">{error}</div>}
            <button
              className="btn btn-primary booking-cta"
              disabled={holding}
              onClick={continueToCheckout}
            >
              {holding ? 'Holding seats…' : 'Continue to checkout →'}
            </button>
            {isReserved && (
              <p className="hold-note">Seats are held for 10 minutes once you continue.</p>
            )}
          </aside>
        </div>
      </main>
    </PageFrame>
  );
}
