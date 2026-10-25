import { baseApi } from '@/api/baseApi';
import type { Achievement, LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';

export const leaderboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<LeaderboardEntry[], { period?: LeaderboardPeriod } | void>({
      query: (params) => ({ url: params?.period ? `/leaderboard?period=${params.period}` : '/leaderboard' }),
      providesTags: [{ type: 'Leaderboard', id: 'LIST' }],
    }),
    getAchievements: builder.query<Achievement[], void>({
      query: () => ({ url: '/leaderboard/achievements' }),
      providesTags: [{ type: 'Leaderboard', id: 'ACHIEVEMENTS' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLeaderboardQuery, useGetAchievementsQuery } = leaderboardApi;
