// client/src/features/auth/authSlice.ts

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
} from "@/api/auth.api";

import type {
  AuthState,
  LoginPayload,
  User,
} from "./auth.types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,
};

// =========================================================
// LOGIN
// =========================================================

export const login = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await loginApi(payload);

    if (!response.success) {
      return rejectWithValue(response.message ?? "Login failed");
    }

    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ?? "Login failed",
    );
  }
});

// =========================================================
// INITIALIZE AUTH
// =========================================================

export const initializeAuth = createAsyncThunk<User | null, void>(
  "auth/initialize",
  async () => {
    try {
      const response = await getCurrentUserApi();

      if (!response.success) {
        return null;
      }

      return response.data.user;
    } catch {
      return null;
    }
  },
);

// =========================================================
// LOGOUT
// =========================================================

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ?? "Logout failed",
    );
  }
});

// =========================================================
// SLICE
// =========================================================

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // LOGIN
      // =====================================================

      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Login failed";
      })

      // =====================================================
      // INITIALIZE AUTH
      // =====================================================

      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;

        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })

      // =====================================================
      // LOGOUT
      // =====================================================

      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
        state.error = null;
      })

      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Logout failed";
      });
  },
});

export const {
  clearAuthError,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;