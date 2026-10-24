export const VOUCHER_VALUE_CENTS = 200;
export const MAX_BILL_CENTS = 99_999;

export interface PaymentMath {
  voucherCount: number;
  maxVouchers: number;
  voucherCents: number;
  cashCents: number;
  balanceAfterCents: number;
}

interface PaymentMathInput {
  billCents: number;
  hawkerRemainingCents: number;
  selectedCount?: number | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computePayment({
  billCents,
  hawkerRemainingCents,
  selectedCount,
}: PaymentMathInput): PaymentMath {
  const safeBill = clamp(Math.round(billCents), 0, MAX_BILL_CENTS);
  const safeBalance = Math.max(0, Math.round(hawkerRemainingCents));
  const maxByBill = Math.floor(safeBill / VOUCHER_VALUE_CENTS);
  const maxByBalance = Math.floor(safeBalance / VOUCHER_VALUE_CENTS);
  const maxVouchers = Math.min(maxByBill, maxByBalance);
  const voucherCount = clamp(
    selectedCount === null || selectedCount === undefined ? maxVouchers : Math.round(selectedCount),
    0,
    maxVouchers,
  );
  const voucherCents = voucherCount * VOUCHER_VALUE_CENTS;

  return {
    voucherCount,
    maxVouchers,
    voucherCents,
    cashCents: safeBill - voucherCents,
    balanceAfterCents: safeBalance - voucherCents,
  };
}

export function parseBillInput(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed * 100), MAX_BILL_CENTS);
}

export function formatMoney(cents: number, style: 'compact' | 'exact' = 'compact'): string {
  const safe = Math.max(0, Math.round(cents));
  const needsCents = style === 'exact' || safe % 100 !== 0;
  return `$${(safe / 100).toLocaleString('en-SG', {
    minimumFractionDigits: needsCents ? 2 : 0,
    maximumFractionDigits: needsCents ? 2 : 0,
  })}`;
}

export function generateReference(): string {
  const first = Math.floor(1000 + Math.random() * 9000);
  const second = Math.floor(1000 + Math.random() * 9000);
  return `CDC-${first}-${second}`;
}

export function formatOfflineCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`.trim();
}

export function generateOfflineCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
