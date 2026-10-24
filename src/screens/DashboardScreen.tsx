import { useRef } from 'react';
import type { AppState, Category, Screen } from '../types';
import { formatMoney } from '../lib/payment';
import { MapPinIcon, ScanIcon, WalletIcon } from '../components/icons';
import { MetaRow, MoreButton } from '../components/ScreenChrome';

interface DashboardScreenProps {
  state: AppState;
  onNavigate: (screen: Screen) => void;
  onOpenMenu: () => void;
  showToast: (message: string) => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  hawker: 'Hawkers, heartland shops',
  supermarket: 'Supermarkets',
};

export function DashboardScreen({
  state,
  onNavigate,
  onOpenMenu,
  showToast,
}: DashboardScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalClaimed = state.allocations.hawker + state.allocations.supermarket;
  const totalUsed = state.used.hawker + state.used.supermarket;
  const totalLeft = totalClaimed - totalUsed;

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="screen dashboard-screen">
      <header className="screen-head">
        <MetaRow
          left={<span className="meta-label">03 · Dashboard</span>}
          right={<MoreButton onClick={onOpenMenu} />}
        />
        <MetaRow
          className="dash-status"
          left={<span className="dash-time">12:40</span>}
          right={<span className="dash-user">TAN W•• M••</span>}
          bordered
        />
      </header>

      <div className="screen-scroll dashboard-scroll" ref={scrollRef}>
        <main className="dashboard-body">
          <header className="dash-heading">
            <h1>Your vouchers</h1>
            <p>Claimed 12 Jun 2027 · expires 31 Dec</p>
          </header>

          <section className="balance-summary" aria-label="Voucher balance">
            <div className="balance-item">
              <span>Claimed</span>
              <strong>{formatMoney(totalClaimed)}</strong>
            </div>
            <div className="balance-item">
              <span>Used</span>
              <strong>{formatMoney(totalUsed)}</strong>
            </div>
            <div className="balance-item">
              <span>Left</span>
              <strong>{formatMoney(totalLeft)}</strong>
            </div>
          </section>

          <section className="category-list" aria-label="Spending by category">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
              const allocation = state.allocations[category];
              const remaining = Math.max(0, allocation - state.used[category]);
              const percentage = allocation > 0 ? (remaining / allocation) * 100 : 0;

              return (
                <div className="category-card" key={category}>
                  <p className="category-name">{CATEGORY_LABELS[category]}</p>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label={`${CATEGORY_LABELS[category]} remaining`}
                    aria-valuemin={0}
                    aria-valuemax={allocation}
                    aria-valuenow={remaining}
                    aria-valuetext={`${formatMoney(remaining)} of ${formatMoney(allocation)} left`}
                  >
                    <div className="progress-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="category-caption">
                    {formatMoney(remaining)} of {formatMoney(allocation)} left
                  </p>
                </div>
              );
            })}
          </section>

          <section className="redemptions" aria-label="Recent redemptions">
            <h2>Recent redemptions · {state.totalRedemptions} total</h2>
            <ul className="redemption-list">
              {state.redemptions.slice(0, 3).map((redemption) => (
                <li key={redemption.id}>
                  <span>{redemption.merchant}</span>
                  <span className="redemption-amount">
                    −{formatMoney(redemption.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      <div className="tab-shell">
        <nav className="tab-bar" aria-label="Primary">
          <button
            type="button"
            className="tab is-active"
            aria-current="page"
            onClick={scrollToTop}
          >
            <WalletIcon />
            <span className="tab-label">Vouchers</span>
          </button>
          <button type="button" className="tab" onClick={() => onNavigate('scan')}>
            <ScanIcon />
            <span className="tab-label">Scan to pay</span>
          </button>
          <button
            type="button"
            className="tab"
            onClick={() => showToast('“Where to spend” is not part of this prototype.')}
          >
            <MapPinIcon />
            <span className="tab-label">Where to spend</span>
          </button>
        </nav>
        <div className="home-indicator" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
