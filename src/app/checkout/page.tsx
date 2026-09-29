'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageFrame } from '@/components/site';

type Ticket = { id: number; name: string; price: number };
type Event = {
  id: number;
  title: string;
  tickets: Ticket[];
  seats?: { id: number; label: string }[];
};
export default function Checkout() {
  return (
    <Suspense
      fallback={
        <PageFrame>
          <div className="empty">Loading checkout…</div>
        </PageFrame>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
function CheckoutForm() {
  const router = useRouter();
  const p = useSearchParams();
  const eventId = Number(p.get('event'));
  const ticketTypeId = Number(p.get('ticket'));
  const quantity = Number(p.get('qty') ?? 1);
  const seatIds = (p.get('seats') ?? '').split(',').filter(Boolean).map(Number);
  const [event, setEvent] = useState<Event>();
  const [form, setForm] = useState({ name: '', email: '' });
  const [state, setState] = useState('');
  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setEvent(d.events.find((item: Event) => item.id === eventId)));
  }, [eventId]);
  if (!event)
    return (
      <PageFrame>
        <div className="empty">Loading checkout…</div>
      </PageFrame>
    );
  const ticket = event.tickets.find((item) => item.id === ticketTypeId) ?? event.tickets[0];
  if (!ticket)
    return (
      <PageFrame>
        <div className="empty">Ticket type unavailable.</div>
      </PageFrame>
    );
  const subtotal = ticket.price * quantity;
  const fee = subtotal * 0.08;
  const selectedLabels =
    event.seats?.filter((seat) => seatIds.includes(seat.id)).map((seat) => seat.label) ?? [];
  const pay = async (payment: 'success' | 'failure') => {
    setState('loading');
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId,
        ticketTypeId: ticket.id,
        quantity,
        seatIds: seatIds.length ? seatIds : undefined,
        attendeeName: form.name,
        attendeeEmail: form.email,
        payment,
      }),
    });
    const data = await response.json();
    if (!response.ok) return setState(data.error);
    router.push(`/confirmation?code=${data.booking.bookingCode}`);
  };
  return (
    <PageFrame>
      <main style={{ maxWidth: 850, margin: '55px auto' }}>
        <div className="eyebrow">Almost there</div>
        <h1 style={{ fontSize: 48, letterSpacing: '-.07em' }}>Complete your booking</h1>
        <div className="detail-content">
          <form
            className="detail-panel form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              pay('success');
            }}
          >
            <h2>Attendee details</h2>
            <label>
              Full name
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <div className="notice">Mock payment · no card details collected</div>
            {state && state !== 'loading' && <div className="notice">{state}</div>}
            <button className="btn btn-primary">Simulate successful payment</button>
            <button type="button" className="btn btn-ghost" onClick={() => pay('failure')}>
              Simulate failed payment
            </button>
          </form>
          <aside className="detail-panel">
            <div className="eyebrow">Order summary</div>
            <h2>{event.title}</h2>
            {selectedLabels.length ? (
              <div className="selected-seats">
                <b>Seats</b>
                <span>{selectedLabels.join(' · ')}</span>
              </div>
            ) : (
              <p className="muted">
                {ticket.name} × {quantity}
              </p>
            )}
            <hr />
            <p>
              Subtotal <b style={{ float: 'right' }}>${subtotal.toFixed(2)}</b>
            </p>
            <p>
              Service fee <b style={{ float: 'right' }}>${fee.toFixed(2)}</b>
            </p>
            <h2>
              Total{' '}
              <span style={{ float: 'right', color: 'var(--orange)' }}>
                ${(subtotal + fee).toFixed(2)}
              </span>
            </h2>
          </aside>
        </div>
      </main>
    </PageFrame>
  );
}
