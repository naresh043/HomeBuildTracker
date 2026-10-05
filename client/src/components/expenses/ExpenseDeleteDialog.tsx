import { AlertTriangle, Loader2, X } from "lucide-react";
import type { Expense } from "@/features/expenses/expense.types";
import { EXPENSE_CATEGORY_LABELS, formatExpenseAmount } from "@/features/expenses/expense.utils";

interface Props {
  expense: Expense | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ExpenseDeleteDialog({ expense, isDeleting, onConfirm, onClose }: Props) {
  if (!expense) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) onClose(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="expense-delete-title" aria-describedby="expense-delete-description" className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></span><div><h2 id="expense-delete-title" className="font-semibold">Remove this expense?</h2><p id="expense-delete-description" className="mt-1 text-sm text-muted-foreground">{EXPENSE_CATEGORY_LABELS[expense.category]} · {formatExpenseAmount(expense.amount)} will leave the active list. You can restore it later.</p></div></div><button type="button" aria-label="Close dialog" disabled={isDeleting} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button></div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={isDeleting} onClick={onClose} className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">Cancel</button><button type="button" disabled={isDeleting} onClick={onConfirm} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground">{isDeleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{isDeleting ? "Removing…" : "Remove expense"}</button></div>
      </section>
    </div>
  );
}
