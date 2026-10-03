import { PackageOpen } from "lucide-react";

interface MaterialEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function MaterialEmptyState({
  hasFilters = false,
  onClearFilters,
}: MaterialEmptyStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <PackageOpen
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 text-base font-semibold text-foreground">
        {hasFilters ? "No materials found" : "No materials yet"}
      </h2>

      <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
        {hasFilters
          ? "No materials match your current search or category filter."
          : "Add your first construction material to start tracking materials used for your house."}
      </p>

      {hasFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
