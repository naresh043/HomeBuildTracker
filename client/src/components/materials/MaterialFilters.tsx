import { Filter, Search, X } from "lucide-react";
import { useMemo } from "react";

interface MaterialFiltersProps {
  search: string;
  category: string;
  categories: string[];
  showDeleted: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onShowDeletedChange: (value: boolean) => void;
  onClear: () => void;
}

export default function MaterialFilters({
  search,
  category,
  categories,
  showDeleted,
  onSearchChange,
  onCategoryChange,
  onShowDeletedChange,
  onClear,
}: MaterialFiltersProps) {
  const hasActiveFilters = useMemo(
    () =>
      search.trim().length > 0 ||
      category !== "" ||
      showDeleted,
    [search, category, showDeleted],
  );

  return (
    <section
      aria-label="Material filters"
      className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm"
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
              Filter Materials
            </h2>

            <p className="text-xs text-muted-foreground">
              Find a construction material quickly.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          htmlFor="material-search"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Search
        </label>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            id="material-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search material name..."
            autoComplete="off"
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mt-4">
        <label
          htmlFor="material-filter-category"
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          Category
        </label>

        <select
          id="material-filter-category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        >
          <option value="">All categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Deleted materials */}
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            Show deleted materials
          </span>

          <span className="block text-xs text-muted-foreground">
            Include materials that were soft deleted.
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