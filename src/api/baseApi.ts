import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { sessionEstablished, sessionTimedOut } from '@/features/auth/authSlice';
import { readSession } from '@/utils/session';
import type { LoginResponse } from '@/types/user';

const NO_REAUTH_PATHS = ['/auth/refresh', '/auth/login'];

function requestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !NO_REAUTH_PATHS.includes(requestUrl(args))) {
    const refreshToken = readSession()?.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery({ url: '/auth/refresh', method: 'POST', body: { refreshToken } }, api, extraOptions);

      if (refreshResult.data) {
        api.dispatch(sessionEstablished(refreshResult.data as LoginResponse));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(sessionTimedOut());
      }
    } else {
      api.dispatch(sessionTimedOut());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Campaign', 'Group', 'GroupLibrary', 'Submission', 'Wallet', 'Withdrawal', 'Leaderboard', 'Notification', 'WorkerPerformance'],
  endpoints: () => ({}),
});
