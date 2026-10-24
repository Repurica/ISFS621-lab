import type { AppState, Payment } from '../types';
import { createSeedState } from './seed';

export type AppAction =
  | { type: 'claim' }
  | { type: 'pay'; payment: Payment }
  | { type: 'toggle-sound' }
  | { type: 'reset' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'claim':
      return { ...state, claimed: true };

    case 'pay': {
      const { payment } = action;
      const category = payment.category;
      const used = {
        ...state.used,
        [category]: Math.min(state.allocations[category], state.used[category] + payment.voucherCents),
      };

      return {
        ...state,
        used,
        redemptions: [
          {
            id: `${payment.reference}-${Date.now()}`,
            merchant: payment.merchant,
            amountCents: payment.voucherCents,
            category,
            dateLabel: 'Just now',
          },
          ...state.redemptions,
        ],
        totalRedemptions: state.totalRedemptions + 1,
        today: {
          salesCents: state.today.salesCents + payment.voucherCents,
          count: state.today.count + 1,
        },
        lastPayment: payment,
      };
    }

    case 'toggle-sound':
      return { ...state, soundOn: !state.soundOn };

    case 'reset':
      return createSeedState();

    default:
      return state;
  }
}
