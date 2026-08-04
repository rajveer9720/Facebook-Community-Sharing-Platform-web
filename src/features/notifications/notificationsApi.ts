import { baseApi } from '@/api/baseApi';
import type { NotificationItem } from '@/types/notification';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<NotificationItem[], void>({
      query: () => ({ url: '/notifications/me' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'Notification' as const, id: item.id })),
              { type: 'Notification' as const, id: 'LIST' },
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation<NotificationItem, { id: number }>({
      query: ({ id }) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Notification', id: arg.id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi;
