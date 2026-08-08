import { baseApi } from '@/api/baseApi';
import type { CreateStaffRequest, StaffAccount, StaffSummary, UpdateStaffRequest } from '@/types/admin';

export const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffSummary[], void>({
      query: () => ({ url: '/admins' }),
      providesTags: (result) =>
        result
          ? [...result.map((staff) => ({ type: 'Staff' as const, id: staff.id })), { type: 'Staff' as const, id: 'LIST' }]
          : [{ type: 'Staff' as const, id: 'LIST' }],
    }),
    createStaff: builder.mutation<StaffAccount, CreateStaffRequest>({
      query: (body) => ({ url: '/admins', method: 'POST', body }),
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    updateStaff: builder.mutation<StaffSummary, { id: string; body: UpdateStaffRequest }>({
      query: ({ id, body }) => ({ url: `/admins/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Staff', id: arg.id }, { type: 'Staff', id: 'LIST' }],
    }),
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({ url: `/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Staff', id }, { type: 'Staff', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } = adminsApi;
