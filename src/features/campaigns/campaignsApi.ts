import { baseApi } from '@/api/baseApi';
import type { Campaign, CampaignStatus, CreateCampaignRequest } from '@/types/campaign';

export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<Campaign[], { status?: CampaignStatus } | void>({
      query: (params) => ({
        url: params?.status ? `/campaigns?status=${params.status}` : '/campaigns',
      }),
      providesTags: (result) =>
        result
          ? [...result.map((c) => ({ type: 'Campaign' as const, id: c.id })), { type: 'Campaign' as const, id: 'LIST' }]
          : [{ type: 'Campaign' as const, id: 'LIST' }],
    }),
    getCampaignById: builder.query<Campaign, string>({
      query: (id) => ({ url: `/campaigns/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),
    createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
      query: (body) => ({ url: '/campaigns', method: 'POST', body }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),
    pauseCampaign: builder.mutation<Campaign, { id: string }>({
      query: ({ id }) => ({ url: `/campaigns/${id}/pause`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Campaign', id: arg.id }, { type: 'Campaign', id: 'LIST' }],
    }),
    resumeCampaign: builder.mutation<Campaign, { id: string }>({
      query: ({ id }) => ({ url: `/campaigns/${id}/resume`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Campaign', id: arg.id }, { type: 'Campaign', id: 'LIST' }],
    }),
    duplicateCampaign: builder.mutation<Campaign, { id: string }>({
      query: ({ id }) => ({ url: `/campaigns/${id}/duplicate`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Campaign', id: arg.id }, { type: 'Campaign', id: 'LIST' }],
    }),
    archiveCampaign: builder.mutation<Campaign, { id: string }>({
      query: ({ id }) => ({ url: `/campaigns/${id}/archive`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Campaign', id: arg.id }, { type: 'Campaign', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useDuplicateCampaignMutation,
  useArchiveCampaignMutation,
} = campaignsApi;
