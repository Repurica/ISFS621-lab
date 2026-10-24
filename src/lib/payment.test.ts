import { describe, expect, it } from 'vitest';
import {
  computePayment,
  formatMoney,
  formatOfflineCode,
  parseBillInput,
  VOUCHER_VALUE_CENTS,
} from './payment';

describe('computePayment', () => {
  it('uses the largest valid number of $2 hawker vouchers', () => {
    expect(
      computePayment({ billCents: 1250, hawkerRemainingCents: 3000 }),
    ).toEqual({
      voucherCount: 6,
      maxVouchers: 6,
      voucherCents: 1200,
      cashCents: 50,
      balanceAfterCents: 1800,
    });
  });

  it('never spends more than the bill', () => {
    const result = computePayment({ billCents: 3001, hawkerRemainingCents: 4000 });
    expect(result.voucherCount).toBe(15);
    expect(result.voucherCents).toBe(3000);
    expect(result.cashCents).toBe(1);
  });

  it('never spends more than the hawker balance', () => {
    const result = computePayment({ billCents: 5000, hawkerRemainingCents: 3000 });
    expect(result.voucherCount).toBe(15);
    expect(result.voucherCents).toBe(3000);
    expect(result.cashCents).toBe(2000);
    expect(result.balanceAfterCents).toBe(0);
  });

  it('uses no vouchers for a bill below $2', () => {
    const result = computePayment({ billCents: 150, hawkerRemainingCents: 3000 });
    expect(result.voucherCount).toBe(0);
    expect(result.voucherCents).toBe(0);
    expect(result.cashCents).toBe(150);
  });

  it('uses no vouchers when the hawker balance is below $2', () => {
    const result = computePayment({ billCents: 500, hawkerRemainingCents: 100 });
    expect(result.voucherCount).toBe(0);
    expect(result.maxVouchers).toBe(0);
  });

  it('honours a smaller manual selection', () => {
    const result = computePayment({
      billCents: 1250,
      hawkerRemainingCents: 3000,
      selectedCount: 3,
    });
    expect(result.voucherCount).toBe(3);
    expect(result.voucherCents).toBe(600);
    expect(result.cashCents).toBe(650);
    expect(result.balanceAfterCents).toBe(2400);
  });

  it('clamps an oversized manual selection to the maximum', () => {
    const result = computePayment({
      billCents: 1250,
      hawkerRemainingCents: 3000,
      selectedCount: 99,
    });
    expect(result.voucherCount).toBe(6);
  });

  it('clamps a negative manual selection to zero', () => {
    const result = computePayment({
      billCents: 1250,
      hawkerRemainingCents: 3000,
      selectedCount: -2,
    });
    expect(result.voucherCount).toBe(0);
    expect(result.cashCents).toBe(1250);
  });

  it('rounds bill amounts to whole cents', () => {
    const result = computePayment({ billCents: 1250.6, hawkerRemainingCents: 3000 });
    expect(result.cashCents + result.voucherCents).toBe(1251);
  });

  it('matches the design voucher value', () => {
    expect(VOUCHER_VALUE_CENTS).toBe(200);
  });
});

describe('formatMoney', () => {
  it('drops cents for compact whole-dollar amounts', () => {
    expect(formatMoney(50_000)).toBe('$500');
    expect(formatMoney(18_000)).toBe('$180');
  });

  it('keeps cents for non-whole amounts', () => {
    expect(formatMoney(1_250)).toBe('$12.50');
  });

  it('always shows cents in exact mode', () => {
    expect(formatMoney(50_000, 'exact')).toBe('$500.00');
    expect(formatMoney(50, 'exact')).toBe('$0.50');
  });
});

describe('parseBillInput', () => {
  it('parses dollars into cents', () => {
    expect(parseBillInput('12.50')).toBe(1250);
    expect(parseBillInput('0.5')).toBe(50);
    expect(parseBillInput('12')).toBe(1200);
  });

  it('handles invalid input safely', () => {
    expect(parseBillInput('')).toBe(0);
    expect(parseBillInput('abc')).toBe(0);
    expect(parseBillInput('-4')).toBe(0);
  });

  it('caps the bill at the supported maximum', () => {
    expect(parseBillInput('10000')).toBe(99_999);
  });
});

describe('formatOfflineCode', () => {
  it('groups a six-digit code into two blocks', () => {
    expect(formatOfflineCode('482913')).toBe('482 913');
  });
});
