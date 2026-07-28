import { baseApi } from '@/api/baseApi';
import type { LoginRequest, LoginResponse } from '@/types/user';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
