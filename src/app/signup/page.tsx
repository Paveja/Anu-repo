'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/site';
export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-auth-action': 'signup' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) return setError(d.error);
    window.location.href = '/';
  };
  return (
    <PageFrame>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="eyebrow">Join the fun</div>
          <h1>Create your account</h1>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Name
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
            <label>
              Password
              <input
                required
                minLength={8}
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            {error && <div className="notice">{error}</div>}
            <button className="btn btn-primary">Create account</button>
          </form>
          <p className="muted">
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--purple)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
