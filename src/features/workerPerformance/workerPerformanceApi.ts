import { baseApi } from '@/api/baseApi';
import type { AdminWorkerPerformanceResponse, WorkerPerformance } from '@/types/workerPerformance';

export const workerPerformanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWorkerPerformance: builder.query<WorkerPerformance, void>({
      query: () => ({ url: '/worker-performance/me' }),
      providesTags: [{ type: 'WorkerPerformance', id: 'ME' }],
    }),
    getAdminWorkerPerformance: builder.query<AdminWorkerPerformanceResponse, void>({
      query: () => ({ url: '/admin/worker-performance' }),
      providesTags: [{ type: 'WorkerPerformance', id: 'ADMIN_LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyWorkerPerformanceQuery, useGetAdminWorkerPerformanceQuery } = workerPerformanceApi;
