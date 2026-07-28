import { registerRoute } from '@/mocks/router';
import { MockApiError } from '@/mocks/errors';
import { credentials, users } from '@/mocks/db';
import { createId } from '@/utils/id';
import type { LoginRequest, LoginResponse } from '@/types/user';

registerRoute('POST', '/auth/login', ({ body }) => {
  const { email, password } = body as LoginRequest;
  const credential = credentials.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!credential || credential.password !== password) {
    throw new MockApiError(401, 'Invalid email or password');
  }
  const user = users.find((u) => u.id === credential.userId);
  if (!user) {
    throw new MockApiError(404, 'User not found');
  }
  const response: LoginResponse = {
    accessToken: createId('token'),
    refreshToken: createId('refresh'),
    user,
  };
  return response;
});
