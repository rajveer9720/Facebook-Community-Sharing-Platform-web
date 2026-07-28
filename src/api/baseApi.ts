import { createApi } from '@reduxjs/toolkit/query/react';
import { mockBaseQuery } from '@/mocks/mockBaseQuery';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: mockBaseQuery,
  tagTypes: ['Campaign', 'Group', 'GroupLibrary', 'Submission', 'Wallet', 'Withdrawal', 'Leaderboard'],
  endpoints: () => ({}),
});
