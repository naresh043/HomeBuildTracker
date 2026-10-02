// client/src/api/auth.api.ts

import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  AuthResponse,
  LoginPayload,
} from "@/features/auth/auth.types";

// =========================================================
// LOGIN
// =========================================================

export const loginApi = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.auth.login,
    payload,
  );

  return response.data;
};

// =========================================================
// CURRENT USER
// =========================================================

export const getCurrentUserApi = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>(
    API_ENDPOINTS.auth.me,
  );

  return response.data;
};

// =========================================================
// LOGOUT
// =========================================================

export const logoutApi = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.auth.logout);
};