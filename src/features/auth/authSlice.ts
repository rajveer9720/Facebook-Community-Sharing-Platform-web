import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, LoginResponse } from '@/types/user';
import { clearSession, readSession, writeSession } from '@/mocks/session';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const existingSession = readSession();

const initialState: AuthState = {
  user: existingSession?.user ?? null,
  accessToken: existingSession?.accessToken ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionEstablished: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      writeSession({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
    },
    signedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      clearSession();
    },
  },
});

export const { sessionEstablished, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
