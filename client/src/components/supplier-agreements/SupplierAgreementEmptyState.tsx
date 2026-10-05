import { FileSignature, Plus, X } from "lucide-react";

interface Props {
  hasFilters: boolean;
  deletedOnly: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export default function SupplierAgreementEmptyState({
  hasFilters,
  deletedOnly,
  onAdd,
  onClear,
}: Props) {
  const title = deletedOnly
    ? "No deleted supplier agreements"
    : hasFilters
      ? "No supplier agreements match these filters"
      : "No supplier agreements yet";

  const description = deletedOnly
    ? "Deleted agreements will appear here and can be restored."
    : hasFilters
      ? "Try changing your filters or clear them to see all agreements."
      : "Create an agreement to track material commitments, advances, and received materials.";

  const showClear = hasFilters || deletedOnly;

  return (
    <section className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-5 py-12">
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileSignature className="h-6 w-6" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2 className="mt-4 w-full text-center text-lg font-semibold">
        {title}
      </h2>

      {/* Description */}
      <div className="flex w-full justify-center">
        <p className="mt-2 w-full max-w-md text-left text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Action */}
      <div className="flex w-full justify-center">
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {deletedOnly ? "View active agreements" : "Clear filters"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Supplier Agreement
          </button>
        )}
      </div>
    </section>
  );
}