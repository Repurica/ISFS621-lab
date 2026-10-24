import { useMemo, useRef, useState } from 'react';
import { AssetIcon } from '../components/icons';
import { MetaRow, MoreButton, Spinner } from '../components/ScreenChrome';
import { Sheet } from '../components/Sheet';
import { useDelayedAction } from '../hooks/useDelayedAction';
import {
  computePayment,
  formatMoney,
  generateReference,
  parseBillInput,
} from '../lib/payment';
import type { AppState, Payment } from '../types';

interface ReviewScreenProps {
  state: AppState;
  onBack: () => void;
  onConfirm: (payment: Payment) => void;
  onOpenMenu: () => void;
}

export function ReviewScreen({ state, onBack, onConfirm, onOpenMenu }: ReviewScreenProps) {
  const [billInput, setBillInput] = useState('12.50');
  const [voucherOverride, setVoucherOverride] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, run } = useDelayedAction();

  const billCents = parseBillInput(billInput);
  const hawkerRemaining = Math.max(0, state.allocations.hawker - state.used.hawker);

  const math = useMemo(
    () =>
      computePayment({
        billCents,
        hawkerRemainingCents: hawkerRemaining,
        selectedCount: voucherOverride,
      }),
    [billCents, hawkerRemaining, voucherOverride],
  );

  const draftMath = useMemo(
    () =>
      computePayment({
        billCents,
        hawkerRemainingCents: hawkerRemaining,
        selectedCount: draftCount,
      }),
    [billCents, hawkerRemaining, draftCount],
  );

  const handleBillChange = (value: string) => {
    let cleaned = value.replace(/[^\d.]/g, '');
    const firstDot = cleaned.indexOf('.');

    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }

    const [whole = '', decimals] = cleaned.split('.');
    cleaned = whole.slice(0, 3) + (decimals !== undefined ? `.${decimals.slice(0, 2)}` : '');

    setBillInput(cleaned);
    setVoucherOverride(null);
    setTouched(true);
  };

  const formatBill = () => {
    setBillInput((parseBillInput(billInput) / 100).toFixed(2));
  };

  const openVoucherSheet = () => {
    setDraftCount(math.voucherCount);
    setSheetOpen(true);
  };

  const applyVoucherSelection = () => {
    const count = Math.min(draftCount, math.maxVouchers);
    setVoucherOverride(count === math.maxVouchers ? null : count);
    setSheetOpen(false);
  };

  const confirm = () => {
    if (billCents <= 0) return;

    const payment: Payment = {
      merchant: 'Ah Seng Noodle',
      stall: 'Stall 01-23, Bedok Market',
      billCents,
      voucherCents: math.voucherCents,
      voucherCount: math.voucherCount,
      cashCents: math.cashCents,
      balanceAfterCents: math.balanceAfterCents,
      reference: state.lastPayment ? generateReference() : 'CDC-8841-2207',
      category: 'hawker',
    };

    run(() => onConfirm(payment), 900);
  };

  return (
    <div className="screen review-screen">
      <header className="review-head">
        <MetaRow
          left={<span className="review-step-label">05 · Review and confirm</span>}
          right={<span className="review-step-count">Step 2 of 2</span>}
        />
        <MetaRow
          className="review-status"
          left={<span className="review-time">12:42</span>}
          right={<MoreButton onClick={onOpenMenu} className="more-button--review" />}
        />
      </header>

      <div className="screen-scroll review-scroll">
        <main className="review-body">
          <section className="merchant">
            <h1>Ah Seng Noodle</h1>
            <div className="merchant-meta">
              <span>Stall 01-23, Bedok Market</span>
              <span className="merchant-dot" aria-hidden="true">
                ·
              </span>
              <span className="merchant-verified">
                verified
                <AssetIcon name="verified" size={14} />
              </span>
            </div>
          </section>

          <section className="bill-section">
            <label className="bill-label" htmlFor="bill-amount">
              Enter bill amount
            </label>
            <div className={`bill-field${touched && billCents === 0 ? ' is-invalid' : ''}`}>
              <span className="bill-currency" aria-hidden="true">
                $
              </span>
              <input
                id="bill-amount"
                ref={inputRef}
                className="bill-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={billInput}
                onChange={(event) => handleBillChange(event.target.value)}
                onBlur={formatBill}
                onFocus={(event) => event.target.select()}
                aria-describedby={touched && billCents === 0 ? 'bill-error' : undefined}
              />
              <button
                type="button"
                className="bill-edit"
                onClick={() => {
                  inputRef.current?.focus();
                  inputRef.current?.select();
                }}
              >
                Edit
              </button>
            </div>
            {touched && billCents === 0 ? (
              <p id="bill-error" className="bill-error">
                Enter a bill amount above $0 to continue.
              </p>
            ) : null}
          </section>

          <section className="voucher-summary" aria-label="Voucher payment summary">
            <div className="summary-row">
              <span>{math.voucherCount} × $2 hawker vouchers</span>
              <strong>{formatMoney(math.voucherCents, 'exact')}</strong>
            </div>
            <div className="summary-row">
              <span>Remainder, cash or PayNow</span>
              <strong>{formatMoney(math.cashCents, 'exact')}</strong>
            </div>
            <div className="summary-divider">
              <div className="summary-row summary-row--total">
                <span>Hawker balance after</span>
                <strong>{formatMoney(math.balanceAfterCents, 'exact')}</strong>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              {math.voucherCount} vouchers applied. {formatMoney(math.cashCents, 'exact')} to pay
              by cash or PayNow. {formatMoney(math.balanceAfterCents, 'exact')} hawker balance
              remaining.
            </p>
          </section>

          <button type="button" className="voucher-link" onClick={openVoucherSheet}>
            <span>Tap to change which vouchers are used.</span>
            <AssetIcon name="chevron-down" size={14} />
          </button>
        </main>
      </div>

      <footer className="review-footer">
        <button
          type="button"
          className="review-confirm"
          onClick={confirm}
          disabled={busy || billCents <= 0}
        >
          {busy ? (
            <>
              <Spinner />
              Confirming…
            </>
          ) : (
            'Confirm payment'
          )}
        </button>
        <button type="button" className="review-cancel" onClick={onBack}>
          Cancel
        </button>
      </footer>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Which vouchers are used"
        subtitle="Ah Seng Noodle accepts hawker vouchers only. Each voucher is worth $2."
        footer={
          <button type="button" className="sheet-done" onClick={applyVoucherSelection}>
            Use {draftMath.voucherCount} voucher{draftMath.voucherCount === 1 ? '' : 's'}
          </button>
        }
      >
        <div className="voucher-picker">
          <button
            type="button"
            className="stepper-button"
            onClick={() => setDraftCount((count) => Math.max(0, count - 1))}
            disabled={draftMath.voucherCount <= 0}
            aria-label="Use one fewer voucher"
          >
            −
          </button>
          <div className="stepper-value">
            <strong>
              {draftMath.voucherCount} × $2
            </strong>
            <span>{formatMoney(draftMath.voucherCents, 'exact')} applied</span>
          </div>
          <button
            type="button"
            className="stepper-button"
            onClick={() => setDraftCount((count) => Math.min(math.maxVouchers, count + 1))}
            disabled={draftMath.voucherCount >= math.maxVouchers}
            aria-label="Use one more voucher"
          >
            +
          </button>
        </div>

        <div className="picker-actions">
          <button type="button" className="text-button" onClick={() => setDraftCount(0)}>
            Use none
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => setDraftCount(math.maxVouchers)}
          >
            Use maximum
          </button>
        </div>

        <dl className="picker-breakdown">
          <div>
            <dt>Available for this bill</dt>
            <dd>{math.maxVouchers} vouchers</dd>
          </div>
          <div>
            <dt>Cash or PayNow</dt>
            <dd>{formatMoney(draftMath.cashCents, 'exact')}</dd>
          </div>
          <div>
            <dt>Hawker balance after</dt>
            <dd>{formatMoney(draftMath.balanceAfterCents, 'exact')}</dd>
          </div>
        </dl>

        <p className="picker-note">
          The rest is paid to the stall directly. Only complete $2 hawker vouchers can be used
          here.
        </p>
      </Sheet>
    </div>
  );
}
