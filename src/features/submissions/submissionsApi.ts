import { baseApi } from '@/api/baseApi';
import type {
  CreateProofUploadUrlRequest,
  CreateProofUploadUrlResponse,
  CreateSubmissionRequest,
  ReviewSubmissionRequest,
  Submission,
  SubmissionStatus,
} from '@/types/submission';

export interface GetSubmissionsParams {
  workerId?: string;
  status?: SubmissionStatus;
}

function buildQueryString(params: GetSubmissionsParams): string {
  const search = new URLSearchParams();
  if (params.workerId) search.set('workerId', params.workerId);
  if (params.status) search.set('status', params.status);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const submissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubmissions: builder.query<Submission[], GetSubmissionsParams | void>({
      query: (params) => ({ url: `/submissions${buildQueryString(params ?? {})}` }),
      providesTags: (result) =>
        result
          ? [...result.map((s) => ({ type: 'Submission' as const, id: s.id })), { type: 'Submission' as const, id: 'LIST' }]
          : [{ type: 'Submission' as const, id: 'LIST' }],
    }),
    createProofUploadUrl: builder.mutation<CreateProofUploadUrlResponse, CreateProofUploadUrlRequest>({
      query: (body) => ({ url: '/submissions/proof-upload-url', method: 'POST', body }),
    }),
    createSubmission: builder.mutation<Submission, CreateSubmissionRequest>({
      query: (body) => ({ url: '/submissions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Submission', id: 'LIST' }, { type: 'Wallet', id: 'ME' }],
    }),
    reviewSubmission: builder.mutation<Submission, { id: string } & ReviewSubmissionRequest>({
      query: ({ id, ...body }) => ({ url: `/submissions/${id}/review`, method: 'POST', body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Submission', id: arg.id },
        { type: 'Submission', id: 'LIST' },
        { type: 'Wallet', id: 'ME' },
      ],
    }),
    getProofSignedUrl: builder.query<{ signedUrl: string; expiresAt: string }, string>({
      query: (id) => ({ url: `/submissions/${id}/proof-url` }),
    }),
    uploadProof: builder.mutation<{ proofUrl: string; objectKey: string }, { file: File; campaignId?: number }>({
      query: ({ file, campaignId }) => {
        const formData = new FormData();
        formData.append('file', file);
        const url = campaignId ? `/submissions/proof-upload?campaignId=${campaignId}` : '/submissions/proof-upload';
        return { url, method: 'POST', body: formData };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubmissionsQuery,
  useCreateProofUploadUrlMutation,
  useCreateSubmissionMutation,
  useReviewSubmissionMutation,
  useGetProofSignedUrlQuery,
  useUploadProofMutation,
} = submissionsApi;
