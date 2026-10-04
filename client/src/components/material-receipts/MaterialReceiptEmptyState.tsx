import { ClipboardList, Plus } from "lucide-react";

interface MaterialReceiptEmptyStateProps {
  hasFilters: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export default function MaterialReceiptEmptyState({
  hasFilters,
  onAdd,
  onClear,
}: MaterialReceiptEmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-12">
      <div className="flex w-full flex-col items-center text-center">
        {/* Icon */}
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
          <ClipboardList
            className="h-6 w-6 text-muted-foreground"
            aria-hidden="true"
          />
        </span>

        {/* Title */}
        <h2 className="mt-4 text-center text-base font-semibold text-foreground">
          {hasFilters
            ? "No receipts match these filters"
            : "No material receipts yet"}
        </h2>

        {/* Description */}
        <p className="mt-1 w-full max-w-sm text-center text-sm text-muted-foreground">
          {hasFilters
            ? "Try changing or clearing the filters."
            : "Record materials as they arrive at the construction site."}
        </p>

        {/* Action */}
        <div className="mt-5 flex w-full items-center justify-center">
          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add first receipt
            </button>
          )}
        </div>
      </div>
    </section>
  );
}