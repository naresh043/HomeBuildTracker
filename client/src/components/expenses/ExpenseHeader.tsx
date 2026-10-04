import { Plus, ReceiptText } from "lucide-react";

interface Props {
  count: number;
  onAdd: () => void;
}

export default function ExpenseHeader({ count, onAdd }: Props) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ReceiptText className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "expense" : "expenses"} on this page
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add expense
      </button>
    </header>
  );
}
