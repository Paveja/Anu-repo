'use client';

import { useMemo, useState } from 'react';

type Market = {
  name: string;
  value: string;
  percentage: string;
  units: string;
  tons: string;
  color: string;
  progress: number;
};

const markets: Market[] = [
  {
    name: 'EU',
    value: 'EU 223,238t',
    percentage: '32.5%',
    units: '32',
    tons: '223,238t',
    color: 'mint',
    progress: 80,
  },
  {
    name: 'CORSIA',
    value: 'CORSIA 179,006t',
    percentage: '24.5%',
    units: '32',
    tons: '179,006t',
    color: 'cyan',
    progress: 38,
  },
  {
    name: 'CH',
    value: 'CH 99,106t',
    percentage: '16.0%',
    units: '32',
    tons: '99,106t',
    color: 'peach',
    progress: 63,
  },
  {
    name: 'UK',
    value: 'UK 94,886t',
    percentage: '15.0%',
    units: '32',
    tons: '94,886t',
    color: 'violet',
    progress: 57,
  },
  {
    name: 'VOL',
    value: 'VOL 54,986t',
    percentage: '5.0%',
    units: '32',
    tons: '54,986t',
    color: 'white',
    progress: 20,
  },
];

function Icon({ name }: { name: string }) {
  return <span className={`icon icon-${name}`} aria-hidden="true" />;
}

function Logo() {
  return (
    <div className="azzera-logo" aria-label="Azzera">
      <span className="logo-mark">◒</span>
      <span>azzera</span>
    </div>
  );
}

function Header() {
  return (
    <header className="dashboard-header">
      <Logo />
      <nav className="primary-nav" aria-label="Primary navigation">
        <button className="nav-item muted">Dashboard</button>
        <button className="nav-item active">
          <Icon name="plane" />
          Aircrafts
        </button>
        <button className="nav-item muted">CORSIA</button>
        <button className="nav-item muted">Settings</button>
      </nav>
      <button className="account-button" aria-label="Open account menu">
        <Icon name="user" />
      </button>
    </header>
  );
}

function FilterToolbar() {
  return (
    <div className="filter-toolbar">
      <div className="search-control">
        <Icon name="search" />
        <span>Search aircraft by registration</span>
      </div>
      <button className="select-control">
        Select Operator <Icon name="chevron" />
      </button>
      <button className="select-control date-control">
        Emission Date Range <Icon name="calendar" />
      </button>
      <button className="icon-button" aria-label="Export aircraft">
        <Icon name="download" />
      </button>
    </div>
  );
}

function PriceControl({ label, value }: { label: string; value: string }) {
  return (
    <div className="price-control">
      <span>{label} €</span>
      <strong>{value}</strong>
      <Icon name="sort" />
    </div>
  );
}

function CarbonToolbar() {
  return (
    <div className="carbon-toolbar">
      <div className="carbon-prices">
        <span className="toolbar-label">CARBON PRICES €/T</span>
        <PriceControl label="EU ETS" value="80" />
        <PriceControl label="UK ETS" value="23.5" />
        <PriceControl label="CORSIA" value="54" />
      </div>
      <div className="transaction-actions">
        <button className="action-button upload">
          <Icon name="upload" />
          Upload Euro control
        </button>
        <button className="action-button insert">
          <Icon name="plus" />
          Insert Transaction
        </button>
      </div>
    </div>
  );
}

function Summary() {
  return (
    <section className="summary-grid" aria-label="Portfolio summary">
      <div className="summary-totals">
        <div className="summary-metric">
          <span className="summary-label">TOTAL CO2e</span>
          <strong>745,687 t</strong>
          <small>across all markets</small>
        </div>
        <div className="summary-metric faded">
          <span className="summary-label">TOTAL COST</span>
          <strong>€54,796,029</strong>
          <small>at current prices</small>
        </div>
      </div>
      <div className="market-summary">
        <span className="summary-label">MARKET SPLIT</span>
        <div className="stacked-bar">
          {markets.map((market) => (
            <span
              key={market.name}
              className={`bar-segment ${market.color}`}
              style={{ flex: market.progress }}
            />
          ))}
        </div>
        <div className="legend-row">
          {markets.map((market) => (
            <div className={`legend-item ${market.color}`} key={market.name}>
              <span>{market.value}</span>
              <small>{market.percentage}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MarketBars() {
  return (
    <div className="market-bars">
      {markets.map((market) => (
        <div className={`market-bar ${market.color}`} key={market.name}>
          <div className="progress-track">
            <span style={{ width: `${market.progress}%` }} />
          </div>
          <span className="market-value">{market.value}</span>
          <span className="market-units">
            {market.units} <small>units</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function MarketRings() {
  return (
    <div className="market-rings">
      {markets.map((market) => (
        <div className={`market-ring ${market.color}`} key={market.name}>
          <span>{market.name}</span>
          <div
            className="ring"
            style={{ '--progress': `${market.progress * 3.6}deg` } as React.CSSProperties}
          >
            <i />
          </div>
          <div className="ring-values">
            <strong>{market.tons.replace('t', '')}</strong>
            <small>tons</small>
            <strong>{market.units}</strong>
            <small>units</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function AircraftCard({ second = false }: { second?: boolean }) {
  return (
    <article className="aircraft-card">
      <div className="card-main">
        <button className="drag-handle" aria-label="Reorder aircraft">
          <Icon name="dots" />
        </button>
        <div className="aircraft-details">
          <div className="identity-row">
            <span className={`type-badge ${second ? 'peach' : 'mint'}`}>GLF6</span>
            <span className="registration-badge">XX-002, Bombardier Global 7500</span>
            <span className="operator-badge">Azzera Business</span>
          </div>
          <div className="metrics-row">
            <Metric value="95" label="flights" />
            <Metric value="23,285" label="CO2e" />
            <Metric value="2.6%" label="share" />
          </div>
          <div className="quoted-price">
            <strong>€1,096,029</strong>
            <small>quoted price</small>
          </div>
        </div>
      </div>
      {second ? <MarketRings /> : <MarketBars />}
      <button className="card-download" aria-label="Download aircraft record">
        <Icon name="download" />
      </button>
    </article>
  );
}

export default function AzzeraDashboard() {
  const [search, setSearch] = useState('');
  const visibleCards = useMemo(() => (search.trim() ? [] : [false, true]), [search]);

  return (
    <main className="azzera-dashboard">
      <Header />
      <div className="dashboard-tools">
        <div className="page-title">
          <strong>Aircraft</strong>
          <span>Rows</span>
        </div>
        <div className="filter-wrap">
          <label className="sr-only" htmlFor="aircraft-search">
            Search aircraft by registration
          </label>
          <div className="search-control">
            <Icon name="search" />
            <input
              id="aircraft-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search aircraft by registration"
            />
          </div>
          <FilterToolbar />
        </div>
      </div>
      <CarbonToolbar />
      <section className="content-surface">
        <Summary />
        <div className="aircraft-list">
          {visibleCards.length > 0 ? (
            visibleCards.map((second) => <AircraftCard key={String(second)} second={second} />)
          ) : (
            <div className="empty-state">No aircraft match this registration.</div>
          )}
        </div>
      </section>
    </main>
  );
}
