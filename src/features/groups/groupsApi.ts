import { baseApi } from '@/api/baseApi';
import type {
  CreateGroupDiscoveryRequest,
  FacebookGroup,
  GroupRecommendationsRequest,
  GroupCoverageStats,
  ModerateGroupRequest,
  GroupStatus,
  UpdateGroupRequest,
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
      query: () => ({ url: '/groups/recommendations', method: 'POST', body: {} }),
      providesTags: [{ type: 'GroupLibrary', id: 'LIST' }],
    }),
    getGroupRecommendations: builder.mutation<WorkerGroupLibraryEntry[], GroupRecommendationsRequest | void>({
      query: (body) => ({ url: '/groups/recommendations', method: 'POST', body: body ?? {} }),
    }),
    submitGroupDiscovery: builder.mutation<FacebookGroup, CreateGroupDiscoveryRequest>({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }, { type: 'Group', id: 'COVERAGE' }],
    }),
    moderateGroup: builder.mutation<FacebookGroup, { id: string; body: ModerateGroupRequest }>({
      query: ({ id, body }) => ({ url: `/groups/${id}/moderate`, method: 'POST', body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'Group', id: 'LIST' },
        { type: 'Group', id: 'COVERAGE' },
      ],
    }),
    updateGroup: builder.mutation<FacebookGroup, { id: string; body: UpdateGroupRequest }>({
      query: ({ id, body }) => ({ url: `/groups/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Group', id: arg.id }, { type: 'Group', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGroupsQuery,
  useGetGroupCoverageQuery,
  useGetWorkerGroupLibraryQuery,
  useGetGroupRecommendationsMutation,
  useSubmitGroupDiscoveryMutation,
  useModerateGroupMutation,
  useUpdateGroupMutation,
} = groupsApi;
