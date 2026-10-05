import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExpensePagination as Pagination } from "@/features/expenses/expense.types";

interface Props { pagination: Pagination; onPageChange: (page: number) => void }

export default function ExpensePagination({ pagination, onPageChange }: Props) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav aria-label="Expense pages" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
      <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} expenses</p>
      <div className="flex gap-2">
        <button type="button" aria-label="Previous page" disabled={!pagination.hasPreviousPage} onClick={() => onPageChange(Math.max(1, pagination.page - 1))} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-medium disabled:opacity-50"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Previous</button>
        <button type="button" aria-label="Next page" disabled={!pagination.hasNextPage} onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-medium disabled:opacity-50">Next<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </nav>
  );
}
