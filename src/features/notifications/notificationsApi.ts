import { baseApi } from '@/api/baseApi';
import type { NotificationItem, NotificationsResponse } from '@/types/notification';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<NotificationsResponse, void>({
      query: () => ({ url: '/notifications/me' }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Notification' as const, id: item.id })),
              { type: 'Notification' as const, id: 'LIST' },
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation<NotificationItem, { id: string }>({
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
