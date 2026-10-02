import { lazy, Suspense } from "react";

import {
  BarChart3,
  CreditCard,
  Package,
  ReceiptText,
  Settings,
} from "lucide-react";

import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/auth/LoginPage";

import AppShell from "@/components/layout/AppShell";
import PageLoadingSkeleton from "@/components/layout/PageLoadingSkeleton";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// =========================================================
// LAZY-LOADED APPLICATION PAGES
// =========================================================

const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));

const FeaturePlaceholderPage = lazy(
  () => import("@/pages/common/FeaturePlaceholderPage"),
);

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoadingSkeleton />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* =====================================================
          PROTECTED APPLICATION
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            }
          />

          <Route
            path="/payments"
            element={
              <LazyPage>
                <FeaturePlaceholderPage
                  title="Payments"
                  description="Track money paid for construction materials, suppliers, contractors and other construction-related payments."
                  icon={CreditCard}
                />
              </LazyPage>
            }
          />

          <Route
            path="/materials"
            element={
              <LazyPage>
                <FeaturePlaceholderPage
                  title="Materials"
                  description="Manage construction materials and material received at the house."
                  icon={Package}
                />
              </LazyPage>
            }
          />

          <Route
            path="/expenses"
            element={
              <LazyPage>
                <FeaturePlaceholderPage
                  title="Expenses"
                  description="Track additional construction expenses that are not represented by material receipts."
                  icon={ReceiptText}
                />
              </LazyPage>
            }
          />

          <Route
            path="/construction"
            element={
              <LazyPage>
                <FeaturePlaceholderPage
                  title="Construction"
                  description="Track construction stages and the current progress of your house."
                  icon={BarChart3}
                />
              </LazyPage>
            }
          />

          <Route
            path="/settings"
            element={
              <LazyPage>
                <FeaturePlaceholderPage
                  title="Settings"
                  description="Manage application and house configuration."
                  icon={Settings}
                />
              </LazyPage>
            }
          />
        </Route>
      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
