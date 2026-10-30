import Link from 'next/link';
import DivisionCalculator from './division-calculator';

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Divide it home">
          <span className="brand-mark" aria-hidden="true">
            ÷
          </span>
          <span>divide it</span>
        </Link>
        <span className="header-note">small steps, clear answers</span>
      </header>

      <div className="content-grid">
        <section className="intro-block" aria-labelledby="practice-heading">
          <p className="eyebrow">A little practice goes a long way</p>
          <h1 id="practice-heading">
            Make division
            <span>feel doable.</span>
          </h1>
          <p className="intro-copy">
            Enter a problem below and we&apos;ll work it out together. No rush — just one clear step
            at a time.
          </p>
          <div className="tip-note">
            <span className="tip-icon" aria-hidden="true">
              ✦
            </span>
            <p>
              <strong>Remember:</strong> the remainder is what&apos;s left after making equal
              groups.
            </p>
          </div>
        </section>

        <DivisionCalculator />
      </div>

      <footer className="site-footer">
        <span>Practice makes progress</span>
        <span className="footer-symbol" aria-hidden="true">
          ✳
        </span>
        <span>Made for curious minds</span>
      </footer>
    </main>
  );
}
