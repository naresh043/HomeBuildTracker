import { FileSignature, Plus } from "lucide-react";

interface ContractEmptyStateProps {
  hasFilters: boolean;
  deletedOnly: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export default function ContractEmptyState({
  hasFilters,
  deletedOnly,
  onAdd,
  onClear,
}: ContractEmptyStateProps) {
  const title = deletedOnly
    ? "No deleted contracts"
    : hasFilters
      ? "No contracts match these filters"
      : "No contracts yet";

  const description = deletedOnly
    ? "Archived contracts will appear here and can be restored."
    : hasFilters
      ? "Adjust or clear your filters to see contracts."
      : "Add a contract to keep its scope, rate, and payments together.";

  return (
    <section className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
        <FileSignature
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h2 className="mt-4 w-full text-center font-semibold">
        {title}
      </h2>

      {/* Description */}
      <div className="flex w-full justify-center">
        <p className="mt-1 w-full max-w-sm text-center !text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex w-full justify-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Clear filters
          </button>
        )}

        {!deletedOnly && !hasFilters && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add contract
          </button>
        )}

        {deletedOnly && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            View active contracts
          </button>
        )}
      </div>
    </section>
  );
}