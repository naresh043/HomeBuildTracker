import { useEffect, useState } from "react";
import { Eye, EyeOff, Home, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { login, clearAuthError } from "@/features/auth/authSlice";
import {
  selectAuthError,
  selectAuthLoading,
} from "@/features/auth/auth.selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const locationState = location.state as LocationState | null;

  const redirectPath = locationState?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return;
    }

    const result = await dispatch(
      login({
        email: normalizedEmail,
        password,
      }),
    );

    if (login.fulfilled.match(result)) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          {/* Logo / Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Home className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              HomeBuild Tracker
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your home construction expenses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                required
                className="flex h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  required
                  className="flex h-11 w-full rounded-lg border bg-background px-3 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {authError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {authError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Private HomeBuild Tracker
          </p>
        </div>
      </div>
    </main>
  );
}
