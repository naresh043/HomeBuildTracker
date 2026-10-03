import {
  AlertCircle,
  CalendarDays,
  Home,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { useHouseQuery } from "@/features/house/house.queries";

import {
  formatHouseBudgetRange,
  formatHouseDate,
  formatHouseStatus,
  getHouseStatusDescription,
} from "@/features/house/house.utils";

import type { House } from "@/features/house/house.types";

export default function HousePage() {
  const houseQuery = useHouseQuery();

  if (houseQuery.isLoading) {
    return <HouseLoadingState />;
  }

  if (houseQuery.isError) {
    return (
      <HouseErrorState
        message={getErrorMessage(
          houseQuery.error,
          "Failed to load house configuration.",
        )}
        onRetry={() => {
          void houseQuery.refetch();
        }}
      />
    );
  }

  const house = houseQuery.data?.data;

  if (!house) {
    return <HouseEmptyState />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-4 pb-24 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Page Header */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Home className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {house.name}
            </h1>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              House configuration
            </p>
          </div>
        </div>
      </section>

      {/* Construction Status */}
      <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-foreground"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {formatHouseStatus(house.status)}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              {getHouseStatusDescription(house.status)}
            </p>
          </div>
        </div>
      </section>

      {/* House Overview */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <HouseInfoCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Construction Started"
          value={formatHouseDate(house.startDate)}
        />

        <HouseInfoCard
          icon={<Wallet className="h-5 w-5" />}
          label="Budget Range"
          value={formatHouseBudgetRange(house.budgetMin, house.budgetMax)}
        />
      </section>

      {/* House Layout */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-4 sm:p-5">
          <h2 className="text-base font-semibold">House Layout</h2>

          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Floors and rooms configured for your house.
          </p>
        </div>

        <div className="divide-y">
          {house.floors.map((floor) => (
            <FloorSection key={floor._id} floor={floor} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HouseInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>

          <p className="mt-1 truncate text-sm font-semibold sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function FloorSection({ floor }: { floor: House["floors"][number] }) {
  return (
    <div className="p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold">{floor.name}</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          {floor.rooms.length} {floor.rooms.length === 1 ? "room" : "rooms"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {floor.rooms.map((room) => (
          <div
            key={room._id}
            className="flex min-h-11 items-center rounded-lg border px-3 py-2.5"
          >
            <span className="truncate text-sm">{room.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HouseLoadingState() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8">
      <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

          <p className="text-sm text-muted-foreground">Loading house...</p>
        </div>
      </div>
    </div>
  );
}

function HouseErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />

          <div className="min-w-0">
            <p className="font-medium">Failed to load house</p>

            <p className="mt-1 text-sm text-muted-foreground">{message}</p>

            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseEmptyState() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Home className="mx-auto h-8 w-8 text-muted-foreground" />

        <h1 className="mt-4 text-lg font-semibold">
          House configuration unavailable
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-5 text-muted-foreground">
          No house configuration was returned by the server.
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
