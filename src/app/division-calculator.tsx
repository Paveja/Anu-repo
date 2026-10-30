'use client';

import { FormEvent, useState } from 'react';

type DivisionResult = {
  quotient: number;
  remainder: number;
};

type InputErrors = {
  dividend?: string;
  divisor?: string;
};

function validateNumber(value: string, label: string) {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  if (!/^\d+$/.test(value)) {
    return `${label} must be a whole number.`;
  }

  if (Number(value) < 1) {
    return `${label} must be greater than 0.`;
  }

  return undefined;
}

export default function DivisionCalculator() {
  const [dividend, setDividend] = useState('');
  const [divisor, setDivisor] = useState('');
  const [errors, setErrors] = useState<InputErrors>({});
  const [result, setResult] = useState<DivisionResult | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      dividend: validateNumber(dividend, 'Dividend'),
      divisor: validateNumber(divisor, 'Divisor'),
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      setResult(null);
      return;
    }

    const dividendValue = Number(dividend);
    const divisorValue = Number(divisor);

    setErrors({});
    setResult({
      quotient: Math.floor(dividendValue / divisorValue),
      remainder: dividendValue % divisorValue,
    });
  }

  function handleReset() {
    setDividend('');
    setDivisor('');
    setErrors({});
    setResult(null);
  }

  return (
    <section className="calculator-shell" aria-labelledby="practice-heading">
      <div className="section-kicker">
        <span className="kicker-line" aria-hidden="true" />
        <span>Try a problem</span>
      </div>

      <form className="division-form" onSubmit={handleSubmit} noValidate>
        <div className="input-grid">
          <label className="number-field" htmlFor="dividend">
            <span className="field-label">Dividend</span>
            <span className="field-help">The number being shared</span>
            <input
              id="dividend"
              inputMode="numeric"
              min="1"
              name="dividend"
              onChange={(event) => setDividend(event.target.value)}
              placeholder="e.g. 84"
              type="text"
              value={dividend}
              aria-describedby={errors.dividend ? 'dividend-error' : undefined}
              aria-invalid={Boolean(errors.dividend)}
            />
            {errors.dividend ? (
              <span className="field-error" id="dividend-error" role="alert">
                {errors.dividend}
              </span>
            ) : null}
          </label>

          <div className="division-symbol" aria-hidden="true">
            ÷
          </div>

          <label className="number-field" htmlFor="divisor">
            <span className="field-label">Divisor</span>
            <span className="field-help">The number of equal groups</span>
            <input
              id="divisor"
              inputMode="numeric"
              min="1"
              name="divisor"
              onChange={(event) => setDivisor(event.target.value)}
              placeholder="e.g. 7"
              type="text"
              value={divisor}
              aria-describedby={errors.divisor ? 'divisor-error' : undefined}
              aria-invalid={Boolean(errors.divisor)}
            />
            {errors.divisor ? (
              <span className="field-error" id="divisor-error" role="alert">
                {errors.divisor}
              </span>
            ) : null}
          </label>
        </div>

        <div className="form-actions">
          <button className="calculate-button" type="submit">
            Find the answer <span aria-hidden="true">→</span>
          </button>
          {(result || Object.keys(errors).length > 0) && (
            <button className="reset-button" onClick={handleReset} type="button">
              Start over
            </button>
          )}
        </div>
      </form>

      {result ? (
        <div className="result-card" aria-live="polite">
          <div className="result-heading">
            <span className="result-label">Your answer</span>
            <span className="answer-mark" aria-hidden="true">
              Nice work
            </span>
          </div>
          <div className="answer-equation">
            <span>{dividend}</span>
            <span aria-hidden="true">÷</span>
            <span>{divisor}</span>
            <span aria-hidden="true">=</span>
            <strong>{result.quotient}</strong>
            <span className="remainder-text">remainder {result.remainder}</span>
          </div>
          <p className="explanation">
            {dividend} divides into {result.quotient} groups of {divisor}
            {result.remainder > 0 ? `, with ${result.remainder} left over.` : ' exactly.'}
          </p>
        </div>
      ) : (
        <div className="result-placeholder" aria-live="polite">
          <span className="placeholder-dot" aria-hidden="true" />
          <p>Your answer will appear here.</p>
        </div>
      )}
    </section>
  );
}
