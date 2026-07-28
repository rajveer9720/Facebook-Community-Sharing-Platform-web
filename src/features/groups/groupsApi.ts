import { baseApi } from '@/api/baseApi';
import type {
  CreateGroupDiscoveryRequest,
  FacebookGroup,
  GroupCoverageStats,
  GroupStatus,
  WorkerGroupLibraryEntry,
} from '@/types/group';

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<FacebookGroup[], { status?: GroupStatus } | void>({
      query: (params) => ({ url: params?.status ? `/groups?status=${params.status}` : '/groups' }),
      providesTags: (result) =>
        result
          ? [...result.map((g) => ({ type: 'Group' as const, id: g.id })), { type: 'Group' as const, id: 'LIST' }]
          : [{ type: 'Group' as const, id: 'LIST' }],
    }),
    getGroupCoverage: builder.query<GroupCoverageStats, void>({
      query: () => ({ url: '/groups/coverage' }),
      providesTags: [{ type: 'Group', id: 'COVERAGE' }],
    }),
    getWorkerGroupLibrary: builder.query<WorkerGroupLibraryEntry[], void>({
      query: () => ({ url: '/groups/library' }),
      providesTags: [{ type: 'GroupLibrary', id: 'LIST' }],
    }),
    submitGroupDiscovery: builder.mutation<FacebookGroup, CreateGroupDiscoveryRequest>({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }, { type: 'Group', id: 'COVERAGE' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGroupsQuery,
  useGetGroupCoverageQuery,
  useGetWorkerGroupLibraryQuery,
  useSubmitGroupDiscoveryMutation,
} = groupsApi;
