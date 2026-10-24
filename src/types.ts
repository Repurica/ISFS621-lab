export type Screen = 'login' | 'claim' | 'dashboard' | 'scan' | 'review' | 'retailer';

export type Category = 'hawker' | 'supermarket';

export interface Redemption {
  id: string;
  merchant: string;
  amountCents: number;
  category: Category;
  dateLabel: string;
}

export interface Payment {
  merchant: string;
  stall: string;
  billCents: number;
  voucherCents: number;
  voucherCount: number;
  cashCents: number;
  balanceAfterCents: number;
  reference: string;
  category: Category;
}

export interface AppState {
  version: 1;
  claimed: boolean;
  allocations: Record<Category, number>;
  used: Record<Category, number>;
  redemptions: Redemption[];
  totalRedemptions: number;
  today: {
    salesCents: number;
    count: number;
  };
  soundOn: boolean;
  lastPayment: Payment | null;
}
