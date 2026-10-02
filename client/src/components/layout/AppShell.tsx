import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";

const primaryNavigation = [
  {
    label: "Home",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Payments",
    path: "/payments",
    icon: CreditCard,
  },
  {
    label: "Materials",
    path: "/materials",
    icon: Package,
  },
];

const secondaryNavigation = [
  {
    label: "Expenses",
    path: "/expenses",
    icon: ReceiptText,
  },
  {
    label: "Construction",
    path: "/construction",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

interface NavigationItemProps {
  label: string;
  path: string;
  icon: typeof Home;
  mobile?: boolean;
  onNavigate?: () => void;
}

function NavigationItem({
  label,
  path,
  icon: Icon,
  mobile = false,
  onNavigate,
}: NavigationItemProps) {
  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group relative flex min-w-0 transition-all duration-150 ease-out",

          mobile
            ? "flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg px-0 py-1"
            : "items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",

          isActive
            ? mobile
              ? "bg-muted font-semibold text-foreground"
              : "bg-muted font-semibold text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {!mobile && isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary"
            />
          )}

          <span
            className={[
              "flex shrink-0 items-center justify-center transition-all duration-150",

              mobile ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-lg",

              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground group-hover:bg-background group-hover:text-foreground",
            ].join(" ")}
          >
            <Icon className={mobile ? "h-3.5 w-3.5" : "h-[17px] w-[17px]"} />
          </span>

          <span
            className={[
              "block min-w-0 max-w-full truncate leading-none",
              mobile
                ? "w-full text-center text-[9px] font-medium"
                : "font-medium",
              isActive ? "font-semibold" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      {/* =====================================================
          SIDEBAR BRAND
      ===================================================== */}

      <div className="flex h-[70px] items-center border-b px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Home className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-foreground">
              HomeBuild Tracker
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Home construction
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ===================================================== */}

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto p-4"
      >
        {primaryNavigation.map((item) => (
          <NavigationItem key={item.path} {...item} />
        ))}

        <div aria-hidden="true" className="my-4 border-t" />

        {secondaryNavigation.map((item) => (
          <NavigationItem key={item.path} {...item} />
        ))}
      </nav>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <div className="border-t p-4">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-background">
            <LogOut className="h-[17px] w-[17px]" />
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <Sidebar onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* =================================================
              MOBILE / TABLET HEADER
          ================================================= */}

          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm lg:hidden">
                <Home className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-foreground">
                  HomeBuild Tracker
                </p>

                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  Home construction tracker
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background text-foreground shadow-sm transition-colors hover:bg-muted active:scale-95 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </header>

          {/* =================================================
              MOBILE MENU
              
              IMPORTANT:
              This is ONLY the dropdown menu.
              The fixed bottom navigation is NOT inside here.
          ================================================= */}

          {mobileMenuOpen && (
            <div className="fixed inset-x-0 top-16 z-30 border-b bg-background shadow-lg lg:hidden">
              <nav aria-label="Mobile menu" className="space-y-1 p-4">
                {[...primaryNavigation, ...secondaryNavigation].map((item) => (
                  <NavigationItem
                    key={item.path}
                    {...item}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ))}

                <div aria-hidden="true" className="my-3 border-t" />

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleLogout();
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg group-hover:bg-background">
                    <LogOut className="h-[17px] w-[17px]" />
                  </span>

                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}

          {/* =================================================
              MAIN CONTENT

              Reserve enough space for the fixed mobile
              bottom navigation.
          ================================================= */}

          <main className="min-w-0 flex-1 pb-[calc(var(--mobile-nav-height)+var(--safe-area-bottom)+1rem)] lg:pb-0">
            <Outlet />
          </main>

          {/* =================================================
              MOBILE BOTTOM NAVIGATION

              This is the ONLY fixed bottom navigation.
          ================================================= */}

          <nav
            aria-label="Mobile bottom navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-1 pb-[var(--safe-area-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.04)] backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex h-[var(--mobile-nav-height)] max-w-lg items-stretch">
              {primaryNavigation.map((item) => (
                <NavigationItem key={item.path} {...item} mobile />
              ))}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg px-0 py-1 text-[9px] font-medium leading-none text-muted-foreground transition-colors hover:text-foreground active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-muted">
                  <Menu className="h-3.5 w-3.5" />
                </span>

                <span className="w-full truncate text-center">More</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
    