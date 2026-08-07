import { baseApi } from '@/api/baseApi';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '@/types/role';

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => ({ url: '/roles' }),
      providesTags: (result) =>
        result
          ? [...result.map((role) => ({ type: 'Role' as const, id: role.id })), { type: 'Role' as const, id: 'LIST' }]
          : [{ type: 'Role' as const, id: 'LIST' }],
    }),
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation<Role, { id: string; body: UpdateRoleRequest }>({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Role', id: arg.id }, { type: 'Role', id: 'LIST' }],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = rolesApi;
