import type { PermissionPair } from './user';

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionPair[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: PermissionPair[];
}

export type UpdateRoleRequest = Partial<CreateRoleRequest>;
