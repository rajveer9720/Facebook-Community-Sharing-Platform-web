export type UserRole = 'ADMIN' | 'WORKER';

export interface ApiErrorBody {
  message: string;
  statusCode: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type MoneyMinor = number;

export const CURRENCY = 'GBP';
