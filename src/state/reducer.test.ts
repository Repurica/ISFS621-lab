import { describe, expect, it } from 'vitest';
import type { Payment } from '../types';
import { appReducer } from './reducer';
import { createSeedState } from './seed';

const payment: Payment = {
  merchant: 'Ah Seng Noodle',
  stall: 'Stall 01-23, Bedok Market',
  billCents: 1250,
  voucherCents: 1200,
  voucherCount: 6,
  cashCents: 50,
  balanceAfterCents: 1800,
  reference: 'CDC-8841-2207',
  category: 'hawker',
};

describe('appReducer', () => {
  it('starts with the balances shown in the Figma prototype', () => {
    const state = createSeedState();
    expect(state.claimed).toBe(false);
    expect(state.allocations).toEqual({ hawker: 25_000, supermarket: 25_000 });
    expect(state.used).toEqual({ hawker: 22_000, supermarket: 10_000 });
    expect(state.totalRedemptions).toBe(14);
    expect(state.today).toEqual({ salesCents: 23_600, count: 30 });
  });

  it('marks the household as claimed', () => {
    const state = appReducer(createSeedState(), { type: 'claim' });
    expect(state.claimed).toBe(true);
  });

  it('applies a hawker payment to balances, history, and retailer totals', () => {
    const claimed = appReducer(createSeedState(), { type: 'claim' });
    const state = appReducer(claimed, { type: 'pay', payment });

    expect(state.used).toEqual({ hawker: 23_200, supermarket: 10_000 });
    expect(state.allocations.hawker - state.used.hawker).toBe(1800);
    expect(state.totalRedemptions).toBe(15);
    expect(state.today).toEqual({ salesCents: 24_800, count: 31 });
    expect(state.lastPayment).toBe(payment);
    expect(state.redemptions[0]).toMatchObject({
      merchant: 'Ah Seng Noodle',
      amountCents: 1200,
      category: 'hawker',
      dateLabel: 'Just now',
    });
  });

  it('never drives a category balance below zero', () => {
    const claimed = appReducer(createSeedState(), { type: 'claim' });
    const oversized = { ...payment, voucherCents: 5_000 };
    const state = appReducer(claimed, { type: 'pay', payment: oversized });
    expect(state.used.hawker).toBe(25_000);
  });

  it('toggles sound effects', () => {
    const state = appReducer(createSeedState(), { type: 'toggle-sound' });
    expect(state.soundOn).toBe(false);
  });

  it('resets to the initial demo state', () => {
    const claimed = appReducer(createSeedState(), { type: 'claim' });
    const paid = appReducer(claimed, { type: 'pay', payment });
    const state = appReducer(paid, { type: 'reset' });

    expect(state).toEqual(createSeedState());
    expect(state.claimed).toBe(false);
    expect(state.lastPayment).toBeNull();
  });
});
