import { baseApi } from '@/api/baseApi';
import type {
  AuthMessageResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types/user';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    refresh: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    logout: builder.mutation<AuthMessageResponse, LogoutRequest | void>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
