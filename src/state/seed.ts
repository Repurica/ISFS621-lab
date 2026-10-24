import type { AppState } from '../types';

export function createSeedState(): AppState {
  return {
    version: 1,
    claimed: false,
    allocations: {
      hawker: 25_000,
      supermarket: 25_000,
    },
    used: {
      hawker: 22_000,
      supermarket: 10_000,
    },
    redemptions: [
      {
        id: 'seed-ah-seng',
        merchant: 'Ah Seng Noodle',
        amountCents: 1_200,
        category: 'hawker',
        dateLabel: 'Today',
      },
      {
        id: 'seed-lim-fruits',
        merchant: 'Lim Fruits',
        amountCents: 600,
        category: 'supermarket',
        dateLabel: 'Yesterday',
      },
      {
        id: 'seed-bedok-minimart',
        merchant: 'Bedok Minimart',
        amountCents: 1_400,
        category: 'supermarket',
        dateLabel: '18 Oct',
      },
    ],
    totalRedemptions: 14,
    today: {
      salesCents: 23_600,
      count: 30,
    },
    soundOn: true,
    lastPayment: null,
  };
}
