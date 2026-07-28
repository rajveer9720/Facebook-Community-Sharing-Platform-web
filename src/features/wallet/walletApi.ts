import { baseApi } from '@/api/baseApi';
import type { CreateWithdrawalRequest, Wallet, Withdrawal, WithdrawalReviewAction, WithdrawalStatus } from '@/types/wallet';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWallet: builder.query<Wallet, void>({
      query: () => ({ url: '/wallet/me' }),
      providesTags: [{ type: 'Wallet', id: 'ME' }],
    }),
    getWithdrawals: builder.query<{ items: Withdrawal[] }, { status?: WithdrawalStatus } | void>({
      query: (params) => ({ url: params?.status ? `/wallet/withdrawals?status=${params.status}` : '/wallet/withdrawals' }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((w) => ({ type: 'Withdrawal' as const, id: w.id })),
              { type: 'Withdrawal' as const, id: 'LIST' },
            ]
          : [{ type: 'Withdrawal' as const, id: 'LIST' }],
    }),
    createWithdrawal: builder.mutation<Withdrawal, CreateWithdrawalRequest>({
      query: (body) => ({ url: '/wallet/withdrawals', method: 'POST', body }),
      invalidatesTags: [{ type: 'Withdrawal', id: 'LIST' }, { type: 'Wallet', id: 'ME' }],
    }),
    reviewWithdrawal: builder.mutation<Withdrawal, { id: string; action: WithdrawalReviewAction }>({
      query: ({ id, action }) => ({ url: `/wallet/withdrawals/${id}/review`, method: 'POST', body: { action } }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Withdrawal', id: arg.id },
        { type: 'Withdrawal', id: 'LIST' },
        { type: 'Wallet', id: 'ME' },
      ],
    }),
    completeWithdrawal: builder.mutation<Withdrawal, { id: string }>({
      query: ({ id }) => ({ url: `/wallet/withdrawals/${id}/complete`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Withdrawal', id: arg.id },
        { type: 'Withdrawal', id: 'LIST' },
        { type: 'Wallet', id: 'ME' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyWalletQuery,
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useReviewWithdrawalMutation,
  useCompleteWithdrawalMutation,
} = walletApi;
