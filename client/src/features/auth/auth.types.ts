// client/src/features/auth/auth.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
}
