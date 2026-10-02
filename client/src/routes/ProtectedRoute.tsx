import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  selectAuthInitialized,
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/features/auth/auth.selectors";
import { useAppSelector } from "@/store/hooks";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground"
          aria-label="Loading"
        />

        <p className="text-sm text-muted-foreground">
          Checking your session...
        </p>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const location = useLocation();

  const initialized = useAppSelector(selectAuthInitialized);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!initialized || isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}