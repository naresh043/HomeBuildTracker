import type { RootState } from "@/store/store";

export const selectAuthUser = (state: RootState) => state.auth.user;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState) =>
  state.auth.isLoading;

export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;

export const selectAuthError = (state: RootState) =>
  state.auth.error;