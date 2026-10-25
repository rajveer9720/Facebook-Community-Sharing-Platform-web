import type { StaffRoleSummary } from './user';

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

export interface StaffAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRoleSummary;
  temporaryPassword: string;
}

export interface StaffSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRoleSummary | null;
}

export type UpdateStaffRequest = Partial<CreateStaffRequest>;
