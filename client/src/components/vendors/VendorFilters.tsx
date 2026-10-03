import { Filter, X } from "lucide-react";
import { useMemo } from "react";

import {
  VENDOR_STATUS,
  type VendorStatus,
  type VendorType,
} from "@/features/vendors/vendor.types";
import { getVendorTypeOptions } from "@/features/vendors/vendor.utils";

interface VendorFiltersProps {
  search: string;
  type?: VendorType;
  status?: VendorStatus;
  showDeleted: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (value?: VendorType) => void;
  onStatusChange: (value?: VendorStatus) => void;
  onShowDeletedChange: (value: boolean) => void;
  onClear: () => void;
}

const VendorFilters = ({
  search,
  type,
  status,
  showDeleted,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onShowDeletedChange,
  onClear,
}: VendorFiltersProps) => {
  const vendorTypeOptions = getVendorTypeOptions();

  const hasActiveFilters = useMemo(
    () =>
      search.trim().length > 0 ||
      type !== undefined ||
      status !== undefined ||
      showDeleted,
    [search, type, status, showDeleted],
  );

  return (
    <section
      aria-label="Vendor filters"
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
              Filter Vendors
            </h2>

            <p className="text-xs text-muted-foreground">
              Find a construction vendor quickly.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
          >
            <X
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mt-4">
        <label
          htmlFor="vendor-search"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Search
        </label>

        <input
          id="vendor-search"
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search vendor name..."
          autoComplete="off"
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        />
      </div>

      {/* Type */}
      <div className="mt-4">
        <label
          htmlFor="vendor-filter-type"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Type
        </label>

        <select
          id="vendor-filter-type"
          value={type ?? ""}
          onChange={(event) => {
            const value = event.target.value;

            onTypeChange(
              value
                ? (value as VendorType)
                : undefined,
            );
          }}
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        >
          <option value="">All types</option>

          {vendorTypeOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="mt-4">
        <label
          htmlFor="vendor-filter-status"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Status
        </label>

        <select
          id="vendor-filter-status"
          value={status ?? ""}
          onChange={(event) => {
            const value = event.target.value;

            onStatusChange(
              value
                ? (value as VendorStatus)
                : undefined,
            );
          }}
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        >
          <option value="">All statuses</option>

          <option value={VENDOR_STATUS.ACTIVE}>
            Active
          </option>

          <option value={VENDOR_STATUS.INACTIVE}>
            Inactive
          </option>
        </select>
      </div>

      {/* Deleted vendors */}
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            Show deleted vendors
          </span>

          <span className="block text-xs text-muted-foreground">
            Include vendors that were soft deleted.
          </span>
        </div>

        <input
          type="checkbox"
          checked={showDeleted}
          onChange={(event) =>
            onShowDeletedChange(
              event.target.checked,
            )
          }
          className="h-5 w-5 shrink-0 accent-foreground"
        />
      </label>
    </section>
  );
};

export default VendorFilters;