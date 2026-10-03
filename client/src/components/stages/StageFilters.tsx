import { Filter, X } from "lucide-react";
import { useMemo } from "react";

import type { ConstructionStageStatus } from "@/features/stages/stage.types";
import { formatConstructionStageStatus } from "@/features/stages/stage.utils";

interface StageFiltersProps {
  search: string;
  status: ConstructionStageStatus | "ALL";
  showDeleted: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: ConstructionStageStatus | "ALL",
  ) => void;
  onShowDeletedChange: (value: boolean) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: Array<
  ConstructionStageStatus | "ALL"
> = [
  "ALL",
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
];

export default function StageFilters({
  search,
  status,
  showDeleted,
  onSearchChange,
  onStatusChange,
  onShowDeletedChange,
  onClear,
}: StageFiltersProps) {
  const hasActiveFilters = useMemo(
    () =>
      search.trim().length > 0 ||
      status !== "ALL" ||
      showDeleted,
    [search, status, showDeleted],
  );

  return (
    <section
      aria-label="Stage filters"
      className="w-full rounded-2xl border bg-card p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted"
          >
            <Filter className="h-4 w-4 text-foreground" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              Filter Stages
            </h2>

            <p className="text-xs text-muted-foreground">
              Find a construction stage quickly.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mt-4">
        <label
          htmlFor="stage-search"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Search
        </label>

        <input
          id="stage-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search stage name..."
          autoComplete="off"
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        />
      </div>

      {/* Status */}
      <div className="mt-4">
        <label
          htmlFor="stage-status"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Status
        </label>

        <select
          id="stage-status"
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as ConstructionStageStatus | "ALL",
            )
          }
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "ALL"
                ? "All statuses"
                : formatConstructionStageStatus(option)}
            </option>
          ))}
        </select>
      </div>

      {/* Deleted stages */}
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            Show deleted stages
          </span>

          <span className="block text-xs text-muted-foreground">
            Include stages that were soft deleted.
          </span>
        </div>

        <input
          type="checkbox"
          checked={showDeleted}
          onChange={(event) =>
            onShowDeletedChange(event.target.checked)
          }
          className="h-5 w-5 shrink-0 accent-foreground"
        />
      </label>
    </section>
  );
} 