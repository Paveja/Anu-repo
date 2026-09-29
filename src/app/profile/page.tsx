'use client';
import { useEffect, useState } from 'react';
import { PageFrame } from '@/components/site';
export default function Profile() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);
  return (
    <PageFrame>
      <main className="auth-wrap">
        <div className="auth-card">
          <div className="eyebrow">Your account</div>
          <h1>Profile</h1>
          {user ? (
            <>
              <p>
                <b>{user.name}</b>
                <br />
                <span className="muted">{user.email}</span>
              </p>
              <p className="muted">Account type: {user.role}</p>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'x-auth-action': 'logout' },
                  });
                  window.location.href = '/';
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <p className="muted">Loading profile…</p>
          )}
        </div>
      </main>
    </PageFrame>
  );
}
