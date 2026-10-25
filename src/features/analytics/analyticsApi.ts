import { baseApi } from '@/api/baseApi';
import type { AdminOverviewStats, AnalyticsOverview } from '@/types/analytics';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query<AnalyticsOverview, void>({
      query: () => ({ url: '/analytics/overview' }),
    }),
    getAdminOverview: builder.query<AdminOverviewStats, void>({
      query: () => ({ url: '/admin/overview' }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAnalyticsOverviewQuery, useGetAdminOverviewQuery } = analyticsApi;
