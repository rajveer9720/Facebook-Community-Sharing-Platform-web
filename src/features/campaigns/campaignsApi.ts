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
  }),
  overrideExisting: false,
});

export const { useGetCampaignsQuery, useGetCampaignByIdQuery, useCreateCampaignMutation } = campaignsApi;
