import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, LoginResponse } from '@/types/user';
import { clearSession, readSession, writeSession } from '@/utils/session';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  sessionExpired: boolean;
}

const existingSession = readSession();

const initialState: AuthState = {
  user: existingSession?.user ?? null,
  accessToken: existingSession?.accessToken ?? null,
  sessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionEstablished: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.sessionExpired = false;
      writeSession({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
    },
    signedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.sessionExpired = false;
      clearSession();
    },
    sessionTimedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.sessionExpired = true;
      clearSession();
    },
    sessionExpiredNoticeDismissed: (state) => {
      state.sessionExpired = false;
    },
  },
});

export const { sessionEstablished, signedOut, sessionTimedOut, sessionExpiredNoticeDismissed } = authSlice.actions;
export const authReducer = authSlice.reducer;
