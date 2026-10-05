import { useEffect } from "react";
import { Loader2, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { Expense } from "@/features/expenses/expense.types";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_METHOD_LABELS, formatExpenseAmount, formatExpenseDate } from "@/features/expenses/expense.utils";
import { useExpenseQuery } from "@/features/expenses/expense.queries";

interface Props {
  expense: Expense | null;
  stageName: string;
  currentUserId: string;
  isRestoring: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRestore: (expense: Expense) => void;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd></div>;
}

export default function ExpenseDetailsDialog({ expense, stageName, currentUserId, isRestoring, onClose, onEdit, onDelete, onRestore }: Props) {
  const detailQuery = useExpenseQuery(expense?.id ?? "", Boolean(expense?.isDeleted), Boolean(expense));
  const record = detailQuery.data?.data ?? expense;
  useEffect(() => {
    if (!expense) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expense, onClose]);
  if (!expense || !record) return null;
  const paidBy = record.paidByUserId === currentUserId ? "You" : record.paidByUserId ? "Household member" : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="expense-detail-title" className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{record.isDeleted ? "Deleted expense" : "Expense details"}</p><h2 id="expense-detail-title" className="text-lg font-semibold">{EXPENSE_CATEGORY_LABELS[record.category]}</h2></div><button type="button" aria-label="Close details" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button></header>
        {detailQuery.isLoading && <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading current expense details…</p>}
        {detailQuery.isError && <p role="alert" className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Could not refresh these details. Showing the available list information.</p>}
        <div className="mt-4 flex flex-wrap gap-2">{record.isDeleted && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Deleted</span>}{record.receiptId && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Receipt linked</span>}</div>
        <p className="mt-4 text-2xl font-bold tracking-tight">{formatExpenseAmount(record.amount)}</p>
        <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Expense information</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Date" value={formatExpenseDate(record.date)} /><Detail label="Category" value={EXPENSE_CATEGORY_LABELS[record.category]} /><Detail label="Method" value={EXPENSE_METHOD_LABELS[record.method]} /><Detail label="Construction stage" value={record.stageId ? stageName : undefined} /><Detail label="Paid by" value={paidBy} /></dl></section>
        {record.notes && <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Notes</h3><p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-3 text-sm">{record.notes}</p></section>}
        <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Record history</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Created" value={new Date(record.createdAt).toLocaleString()} /><Detail label="Last updated" value={new Date(record.updatedAt).toLocaleString()} /></dl></section>
        <footer className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">Close</button>{record.isDeleted ? <button type="button" disabled={isRestoring} onClick={() => onRestore(record)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{isRestoring ? "Restoring…" : "Restore"}</button> : <><button type="button" onClick={() => onEdit(record)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"><Pencil className="h-4 w-4" />Edit</button><button type="button" onClick={() => onDelete(record)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" />Delete</button></>}</footer>
      </section>
    </div>
  );
}
