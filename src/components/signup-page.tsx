'use client';

import { FormEvent, useState } from 'react';

type FieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  prefix?: string;
};

const fields: readonly FieldConfig[] = [
  { id: 'first-name', label: 'First Name', placeholder: 'Enter Name', type: 'text' },
  { id: 'last-name', label: 'Last Name', placeholder: 'Enter Name', type: 'text' },
  { id: 'phone', label: 'Phone Number', placeholder: 'Enter Phone No', type: 'tel', prefix: '+1' },
  { id: 'email', label: 'Email', placeholder: 'Enter Email', type: 'email' },
];

function Brand() {
  return (
    <div className="brand" aria-label="FieldPro">
      <span>Field</span>
      <span className="brand-accent">Pro</span>
    </div>
  );
}

function Field({ id, label, placeholder, type, prefix }: (typeof fields)[number]) {
  return (
    <label className="form-field" htmlFor={id}>
      <span className="field-label">
        {label}
        {label !== 'Email' && <span className="required">*</span>}
      </span>
      <span className="input-shell">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          required={label !== 'Email'}
        />
      </span>
    </label>
  );
}

function FieldMapArt() {
  return (
    <div className="field-map-art" aria-hidden="true">
      <div className="map-lines map-lines-left" />
      <div className="map-lines map-lines-right" />
      <div className="map-pin pin-one" />
      <div className="map-pin pin-two" />
      <div className="map-pin pin-three" />
      <div className="map-pin pin-four" />
      <div className="map-card field-card">
        <span className="map-icon map-icon-grid" />
        <span>Field Map</span>
      </div>
      <div className="map-card device-card">
        <span className="map-icon map-icon-device" />
        <span>Device Tracking</span>
      </div>
      <div className="map-card soil-card">
        <span className="map-icon map-icon-soil" />
        <span>
          <strong>28%</strong>
          <small>Soil Moisture</small>
        </span>
      </div>
    </div>
  );
}

function VisualPanel() {
  return (
    <section className="visual-panel" aria-label="FieldPro agriculture insights">
      <div className="visual-wash" />
      <div className="visual-grid" />
      <div className="visual-orb orb-large" />
      <div className="visual-orb orb-small" />
      <Brand />
      <div className="visual-copy">
        <h1>Reliable insights for every acre</h1>
        <p>Built for modern agriculture</p>
      </div>
      <FieldMapArt />
    </section>
  );
}

function SignupForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="signup-content">
      <header className="signup-header">
        <h2>Create your account</h2>
        <p>
          Sign up to shop smart irrigation products, manage orders, and access field-ready
          solutions.
        </p>
      </header>
      <form className="signup-form" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <Field key={field.id} {...field} />
        ))}
        <div className="form-actions">
          <button type="submit">Sign Up</button>
          <p className="signin-copy">
            Already have an account? <a href="#signin">Sign in</a>
          </p>
          {submitted && (
            <p className="success-message" role="status">
              Thanks — your account request is ready.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function SignupPanel() {
  return (
    <aside className="signup-panel">
      <SignupForm />
      <p className="legal-copy">Terms of Service • Privacy Policy</p>
    </aside>
  );
}

export default function SignupPage() {
  return (
    <main className="signup-page">
      <VisualPanel />
      <SignupPanel />
    </main>
  );
}
