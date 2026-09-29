'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default function Admin() {
  const [stats, setStats] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/admin').then(async (r) => {
      const d = await r.json();
      if (!r.ok) setError(d.error);
      else setStats(d.stats);
    });
  }, []);
  return (
    <PageFrame>
      <main style={{ padding: '55px 0' }}>
        <div className="eyebrow">Control room</div>
        <h1 style={{ fontSize: 52, letterSpacing: '-.07em' }}>Admin dashboard</h1>
        {error ? (
          <div className="empty">
            <h3>{error}</h3>
            <Link className="btn btn-primary" href="/login">
              Sign in as admin
            </Link>
            <p className="muted">Demo admin: admin@eventhub.local / Admin123!</p>
          </div>
        ) : (
          stats && (
            <>
              <div className="stat-grid">
                <div className="stat">
                  <span className="muted">Events</span>
                  <b>{stats.events}</b>
                </div>
                <div className="stat">
                  <span className="muted">Users</span>
                  <b>{stats.users}</b>
                </div>
                <div className="stat">
                  <span className="muted">Bookings</span>
                  <b>{stats.bookings}</b>
                </div>
                <div className="stat">
                  <span className="muted">Revenue</span>
                  <b>${Number(stats.revenue).toFixed(0)}</b>
                </div>
              </div>
              <div className="detail-panel">
                <h2>Event management</h2>
                <p className="muted">
                  Catalog CRUD, booking oversight, and user management are ready for the admin API
                  surface.
                </p>
                <div className="table-wrap">
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Capability</th>
                        <th>Status</th>
                      </tr>
                      <tr>
                        <td>Published event catalog</td>
                        <td>Connected</td>
                      </tr>
                      <tr>
                        <td>Booking inventory</td>
                        <td>Connected</td>
                      </tr>
                      <tr>
                        <td>User accounts</td>
                        <td>Connected</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}
      </main>
    </PageFrame>
  );
}
