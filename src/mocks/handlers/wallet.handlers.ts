import { registerRoute } from '@/mocks/router';
import { MockApiError } from '@/mocks/errors';
import { requireSession, requireRole } from '@/mocks/session';
import { wallets, withdrawals } from '@/mocks/db';
import { createId } from '@/utils/id';
import type { CreateWithdrawalRequest, Withdrawal, WithdrawalReviewAction, WithdrawalStatus } from '@/types/wallet';

registerRoute('GET', '/wallet/me', () => {
  const session = requireSession();
  const wallet = wallets[session.user.id];
  if (!wallet) throw new MockApiError(404, 'Wallet not found');
  return wallet;
});

registerRoute('GET', '/wallet/withdrawals', ({ query }) => {
  requireSession();
  const status = query.get('status') as WithdrawalStatus | null;
  const items = status ? withdrawals.filter((w) => w.status === status) : withdrawals;
  return { items };
});

registerRoute('POST', '/wallet/withdrawals', ({ body }) => {
  const session = requireSession();
  requireRole(session, 'WORKER');
  const wallet = wallets[session.user.id];
  if (!wallet) throw new MockApiError(404, 'Wallet not found');

  const payload = body as CreateWithdrawalRequest;
  if (payload.amountMinor <= 0) throw new MockApiError(400, 'Withdrawal amount must be greater than zero');
  if (payload.amountMinor > wallet.availableMinor) {
    throw new MockApiError(400, 'Withdrawal amount exceeds available balance');
  }

  wallet.availableMinor -= payload.amountMinor;
  wallet.withdrawalHoldMinor += payload.amountMinor;

  const withdrawal: Withdrawal = {
    id: createId('wd'),
    workerId: session.user.id,
    worker: {
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      email: session.user.email,
    },
    amountMinor: payload.amountMinor,
    currency: wallet.currency,
    paymentMethod: payload.paymentMethod,
    paymentDetails: payload.paymentDetails,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };
  withdrawals.unshift(withdrawal);
  return withdrawal;
});

registerRoute('POST', '/wallet/withdrawals/:id/review', ({ params, body }) => {
  const session = requireSession();
  requireRole(session, 'ADMIN');

  const withdrawal = withdrawals.find((w) => w.id === params.id);
  if (!withdrawal) throw new MockApiError(404, 'Withdrawal not found');
  if (withdrawal.status !== 'PENDING') throw new MockApiError(409, 'Withdrawal already reviewed');

  const { action } = body as { action: WithdrawalReviewAction };
  const wallet = wallets[withdrawal.workerId];

  if (action === 'APPROVE') {
    withdrawal.status = 'APPROVED';
  } else {
    withdrawal.status = 'REJECTED';
    if (wallet) {
      wallet.withdrawalHoldMinor -= withdrawal.amountMinor;
      wallet.availableMinor += withdrawal.amountMinor;
    }
  }
  return withdrawal;
});

registerRoute('POST', '/wallet/withdrawals/:id/complete', ({ params }) => {
  const session = requireSession();
  requireRole(session, 'ADMIN');

  const withdrawal = withdrawals.find((w) => w.id === params.id);
  if (!withdrawal) throw new MockApiError(404, 'Withdrawal not found');
  if (withdrawal.status !== 'APPROVED') throw new MockApiError(409, 'Only approved withdrawals can be marked paid');

  withdrawal.status = 'COMPLETED';
  const wallet = wallets[withdrawal.workerId];
  if (wallet) {
    wallet.withdrawalHoldMinor -= withdrawal.amountMinor;
    wallet.totalMinor -= withdrawal.amountMinor;
  }
  return withdrawal;
});
