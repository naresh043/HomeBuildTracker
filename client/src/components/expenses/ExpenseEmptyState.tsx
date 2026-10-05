import { ReceiptText, Plus } from "lucide-react";

interface Props {
  hasExpenses: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export default function ExpenseEmptyState({ hasExpenses, onAdd, onClear }: Props) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-12">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <ReceiptText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {hasExpenses ? "No expenses found" : "No expenses yet"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {hasExpenses
            ? "No expenses match your current filters."
            : "Record transport, utilities, tools, and other costs from your house build."}
        </p>
        {hasExpenses ? (
          <button type="button" onClick={onClear} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">
            Clear filters
          </button>
        ) : (
          <button type="button" onClick={onAdd} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add your first expense
          </button>
        )}
      </div>
    </section>
  );
}
