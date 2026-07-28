import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { dispatch } from './router';
import { MockApiError } from './errors';
import './handlers/register';

export interface MockQueryArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export interface MockErrorShape {
  status: number;
  data: { message: string };
}

const SIMULATED_LATENCY_MS = 350;

/**
 * Stands in for `fetchBaseQuery` while there is no NestJS backend yet.
 * Swapping this for a real base query later does not require touching any
 * feature API slice, since they only depend on this function's signature.
 */
export const mockBaseQuery: BaseQueryFn<MockQueryArgs, unknown, MockErrorShape> = async ({
  url,
  method = 'GET',
  body,
}) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  try {
    const data = await dispatch(method, url, body);
    // Clone before handing off to the store: a real HTTP response would never
    // share object identity with server-side memory, and RTK Query's dev-mode
    // Immer autoFreeze would otherwise freeze (and corrupt) our in-memory "database".
    return { data: data === undefined ? data : structuredClone(data) };
  } catch (error) {
    if (error instanceof MockApiError) {
      return { error: { status: error.statusCode, data: { message: error.message } } };
    }
    return { error: { status: 500, data: { message: 'Unexpected mock server error' } } };
  }
};
