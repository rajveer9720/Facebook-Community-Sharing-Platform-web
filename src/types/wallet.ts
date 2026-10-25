import type { MoneyMinor } from './common';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type PaymentMethod = 'Bank transfer' | 'PayPal' | 'Other';

export interface Wallet {
  workerId: string;
  availableMinor: MoneyMinor;
  pendingMinor: MoneyMinor;
  withdrawalHoldMinor: MoneyMinor;
  totalMinor: MoneyMinor;
  currency: string;
}

export interface WithdrawalWorker {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Withdrawal {
  id: string;
  workerId: string;
  worker: WithdrawalWorker;
  amountMinor: MoneyMinor;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDetails: Record<string, string>;
  status: WithdrawalStatus;
  requestedAt: string;
}

export interface CreateWithdrawalRequest {
  amountMinor: MoneyMinor;
  paymentMethod: PaymentMethod;
  paymentDetails: Record<string, string>;
}

export type WithdrawalReviewAction = 'APPROVE' | 'REJECT';
