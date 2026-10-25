import type { AuthUser } from '@/types/user';

const STORAGE_KEY = 'fcsp.session';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function readSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
