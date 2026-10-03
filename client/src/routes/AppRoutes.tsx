import { lazy, Suspense, type ReactNode } from "react";

import {  Package, ReceiptText, Settings } from "lucide-react";

import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import PageLoadingSkeleton from "@/components/layout/PageLoadingSkeleton";

import LoginPage from "@/pages/auth/LoginPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// =========================================================
// LAZY-LOADED APPLICATION PAGES
// =========================================================

const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));

const HousePage = lazy(() => import("@/pages/House/HousePage"));

const ConstructionPage = lazy(
  () => import("@/pages/Construction/ConstructionPage"),
);

const FeaturePlaceholderPage = lazy(
  () => import("@/pages/common/FeaturePlaceholderPage"),
);

function LazyPage({ children }: { children: ReactNode }) {
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
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            }
          />

          {/* =================================================
              HOUSE
          ================================================= */}

          <Route
            path="/house"
            element={
              <LazyPage>
                <HousePage />
              </LazyPage>
            }
          />

          {/* =================================================
              PAYMENTS
          ================================================= */}

          <Route
            path="/payments"
            element={
              <LazyPage>
                <h1>This is the payment page</h1>
              </LazyPage>
            }
          />

          {/* =================================================
              MATERIALS
          ================================================= */}

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

          {/* =================================================
              EXPENSES
          ================================================= */}

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

          {/* =================================================
              CONSTRUCTION
          ================================================= */}

          <Route
            path="/construction"
            element={
              <LazyPage>
                <ConstructionPage />
              </LazyPage>
            }
          />

          {/* =================================================
              SETTINGS
          ================================================= */}

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
