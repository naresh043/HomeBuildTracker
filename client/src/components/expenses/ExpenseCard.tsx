import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Expense } from "@/features/expenses/expense.types";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_METHOD_LABELS, formatExpenseAmount, formatExpenseDate } from "@/features/expenses/expense.utils";

interface Props {
  expense: Expense;
  stageName: string;
  isRestoring: boolean;
  onDetails: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRestore: (expense: Expense) => void;
}

export default function ExpenseCard({ expense, stageName, isRestoring, onDetails, onEdit, onDelete, onRestore }: Props) {
  return (
    <article className={`min-w-0 rounded-2xl border p-4 shadow-sm ${expense.isDeleted ? "border-destructive/30 bg-muted/40" : "border-border bg-card"}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{formatExpenseDate(expense.date)} · {EXPENSE_METHOD_LABELS[expense.method]}</p><h2 className="mt-1 break-words text-base font-semibold text-foreground">{EXPENSE_CATEGORY_LABELS[expense.category]}</h2></div>
        <div className="flex shrink-0 flex-col items-end gap-1">{expense.receiptId && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Receipt linked</span>}{expense.isDeleted && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Deleted</span>}</div>
      </div>
      <div className="mt-4 flex min-w-0 items-end justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0"><p className="break-words text-xl font-bold tracking-tight text-foreground">{formatExpenseAmount(expense.amount)}</p><p className="mt-1 truncate text-sm text-muted-foreground">{stageName}</p>{expense.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground/80">{expense.notes}</p>}</div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label="View expense details" title="View details" onClick={() => onDetails(expense)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" aria-hidden="true" /></button>
          {expense.isDeleted ? <button type="button" aria-label="Restore expense" title="Restore expense" disabled={isRestoring} onClick={() => onRestore(expense)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" aria-hidden="true" />{isRestoring ? "Restoring…" : "Restore"}</button> : <><button type="button" aria-label="Edit expense" title="Edit" onClick={() => onEdit(expense)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" aria-hidden="true" /></button><button type="button" aria-label="Delete expense" title="Delete" onClick={() => onDelete(expense)} className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></>}
        </div>
      </div>
    </article>
  );
}
