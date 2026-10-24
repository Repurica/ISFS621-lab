import { useEffect, useRef, useState } from 'react';
import { MetaRow, MoreButton } from '../components/ScreenChrome';
import { Sheet } from '../components/Sheet';
import { formatMoney } from '../lib/payment';
import { playAcceptedChime } from '../lib/sound';
import type { AppState, Payment } from '../types';

interface RetailerScreenProps {
  state: AppState;
  payment: Payment;
  onNext: () => void;
  onOpenMenu: () => void;
  showToast: (message: string) => void;
}

const ISSUE_REASONS = [
  { value: 'amount', label: 'Amount is wrong' },
  { value: 'voucher', label: 'Voucher was rejected' },
  { value: 'soundbox', label: 'Soundbox issue' },
] as const;

export function RetailerScreen({
  state,
  payment,
  onNext,
  onOpenMenu,
  showToast,
}: RetailerScreenProps) {
  const [issueOpen, setIssueOpen] = useState(false);
  const [reason, setReason] = useState<string>('amount');
  const [note, setNote] = useState('');
  const announcedRef = useRef(false);

  useEffect(() => {
    if (announcedRef.current || !state.soundOn) return;
    announcedRef.current = true;
    playAcceptedChime();
  }, [state.soundOn]);

  const submitIssue = () => {
    setIssueOpen(false);
    setNote('');
    setReason('amount');
    showToast(`Issue reported · ${payment.reference}`);
  };

  return (
    <div className="screen retailer-screen">
      <header className="retailer-head">
        <MetaRow
          left={<span className="retailer-label">06 · Retailer view</span>}
          right={<MoreButton onClick={onOpenMenu} className="more-button--retailer" />}
        />
        <MetaRow
          className="retailer-status"
          left={<span className="retailer-time">12:42</span>}
          right={<span className="soundbox">Soundbox online</span>}
        />
      </header>

      <div className="screen-scroll retailer-scroll">
        <main className="retailer-body">
          <section className="accepted-card" aria-label="Payment accepted">
            <p className="accepted-label">
              {payment.voucherCents > 0 ? 'CDC vouchers accepted' : 'No vouchers used'}
            </p>
            <p className="accepted-amount">{formatMoney(payment.voucherCents, 'exact')}</p>
            <p className="accepted-audio">audio announced</p>
          </section>

          <dl className="payment-details">
            <div>
              <dt>Still to collect</dt>
              <dd className="is-strong">{formatMoney(payment.cashCents, 'exact')} cash</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{payment.reference}</dd>
            </div>
            <div>
              <dt>Settles</dt>
              <dd>Thu, 1 Oct</dd>
            </div>
          </dl>

          <section className="today" aria-label="Today so far">
            <h2>Today so far</h2>
            <div className="today-grid">
              <div className="today-card">
                <span>CDC sales</span>
                <strong>{formatMoney(state.today.salesCents)}</strong>
              </div>
              <div className="today-card">
                <span>Transactions</span>
                <strong>{state.today.count}</strong>
              </div>
            </div>
          </section>

          <p className="sr-only" aria-live="polite">
            Payment accepted. {formatMoney(payment.voucherCents, 'exact')} in CDC vouchers.{' '}
            {formatMoney(payment.cashCents, 'exact')} cash to collect. Reference{' '}
            {payment.reference}.
          </p>
        </main>
      </div>

      <footer className="retailer-footer">
        <button type="button" className="retailer-action" onClick={() => setIssueOpen(true)}>
          Report issue
        </button>
        <button type="button" className="retailer-action" onClick={onNext}>
          Next customer
        </button>
      </footer>

      <Sheet
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Report an issue"
        subtitle={`Payment ${payment.reference} · ${formatMoney(payment.billCents, 'exact')} bill`}
        footer={
          <button type="button" className="sheet-done" onClick={submitIssue}>
            Submit report
          </button>
        }
      >
        <fieldset className="issue-fieldset">
          <legend>What went wrong?</legend>
          {ISSUE_REASONS.map((option) => (
            <label className="issue-option" key={option.value}>
              <input
                type="radio"
                name="issue-reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="issue-note">
          <span>What happened? (optional)</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Tell us what the customer or soundbox reported."
          />
        </label>

        <p className="picker-note">
          This is a simulation. In a live system the issue would be routed to the merchant support
          desk with the payment reference attached.
        </p>
      </Sheet>
    </div>
  );
}
