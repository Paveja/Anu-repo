'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default function Login() {
  const [email, setEmail] = useState('demo@eventhub.local');
  const [password, setPassword] = useState('Welcome123!');
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) return setError(d.error);
    window.location.href = '/';
  };
  return (
    <PageFrame>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="eyebrow">Welcome back</div>
          <h1>Sign in to EventHub</h1>
          <p className="muted">Your next great night is waiting.</p>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <div className="notice">{error}</div>}
            <button className="btn btn-primary">Sign in</button>
          </form>
          <p className="muted">
            New here?{' '}
            <Link href="/signup" style={{ color: 'var(--purple)' }}>
              Create an account
            </Link>
          </p>
          <small className="muted">Demo: demo@eventhub.local / Welcome123!</small>
        </div>
      </div>
    </PageFrame>
  );
}
