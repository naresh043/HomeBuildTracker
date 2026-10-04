import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseDeleteDialog from "@/components/expenses/ExpenseDeleteDialog";
import ExpenseDetailsDialog from "@/components/expenses/ExpenseDetailsDialog";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseFormDialog from "@/components/expenses/ExpenseFormDialog";
import ExpenseHeader from "@/components/expenses/ExpenseHeader";
import { useCreateExpenseMutation, useDeleteExpenseMutation, useRestoreExpenseMutation, useUpdateExpenseMutation } from "@/features/expenses/expense.mutations";
import { useExpensesQuery } from "@/features/expenses/expense.queries";
import { expenseQueryKeys } from "@/features/expenses/expense.queries";
import type { Expense, ExpenseCategory, ExpenseMethod, ExpenseQueryParams } from "@/features/expenses/expense.types";
import type { ExpenseFormValues } from "@/features/expenses/expense.schema";
import { useStagesQuery } from "@/features/stages/stage.queries";
import { useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 10;
type FilterState = {
  search: string;
  category: ExpenseCategory | "";
  method: ExpenseMethod | "";
  stageId: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
  hasReceipt: "" | "true" | "false";
  includeDeleted: boolean;
};
const EMPTY_FILTERS: FilterState = { search: "", category: "", method: "", stageId: "", fromDate: "", toDate: "", minAmount: "", maxAmount: "", hasReceipt: "", includeDeleted: false };

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
};

export default function ExpensesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [details, setDetails] = useState<Expense | null>(null);
  const stagesQuery = useStagesQuery(true);

  const params: ExpenseQueryParams = {
    page,
    limit: PAGE_SIZE,
    q: filters.search.trim() || undefined,
    category: filters.category || undefined,
    method: filters.method || undefined,
    stageId: filters.stageId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    minAmount: filters.minAmount === "" ? undefined : Number(filters.minAmount),
    maxAmount: filters.maxAmount === "" ? undefined : Number(filters.maxAmount),
    hasReceipt: filters.hasReceipt === "" ? undefined : filters.hasReceipt === "true",
    includeDeleted: filters.includeDeleted || undefined,
  };
  const expensesQuery = useExpensesQuery(params);
  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();
  const restoreMutation = useRestoreExpenseMutation();
  const expenses = expensesQuery.data?.data.items ?? [];
  const pagination = expensesQuery.data?.data.pagination;
  const stages = useMemo(() => stagesQuery.data?.data ?? [], [stagesQuery.data?.data]);
  const stageNames = useMemo(() => new Map(stages.map((stage) => [stage._id, `${stage.name}${stage.isDeleted ? " (deleted)" : ""}`])), [stages]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!expensesQuery.isSuccess || !pagination || page <= Math.max(1, pagination.totalPages)) return;
    const timeout = window.setTimeout(() => setPage(Math.max(1, pagination.totalPages)), 0);
    return () => window.clearTimeout(timeout);
  }, [expensesQuery.isSuccess, page, pagination]);

  const changeFilter = (key: string, value: string | boolean) => {
    setFilters((previous) => ({ ...previous, [key]: value } as FilterState));
    setPage(1);
  };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (expense: Expense) => { setDetails(null); setEditing(expense); setFormOpen(true); };
  const closeForm = () => { if (!isSubmitting) { setFormOpen(false); setEditing(null); } };

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!user?.id) { toast.error("Your session could not be identified. Sign in again."); return; }
    try {
      if (editing) {
        const response = await updateMutation.mutateAsync({
          expenseId: editing.id,
          payload: {
            date: values.date,
            amount: values.amount,
            category: values.category,
            paidByUserId: user.id,
            method: values.method,
            stageId: values.stageId || null,
            notes: values.notes.trim() || null,
          },
        });
        toast.success("Expense updated");
        setDetails(response.data);
      } else {
        const response = await createMutation.mutateAsync({
          date: values.date,
          amount: values.amount,
          category: values.category,
          paidByUserId: user.id,
          method: values.method,
          ...(values.stageId ? { stageId: values.stageId } : {}),
          ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
        });
        toast.success("Expense added");
        setPage(1);
        setDetails(response.data);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save expense"));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const response = await deleteMutation.mutateAsync(deleting.id);
      toast("Expense removed from the active list", {
        action: { label: "Restore", onClick: () => { void handleRestore(response.data); } },
        duration: 10000,
      });
      setDeleting(null);
      setDetails(null);
    } catch (error) { toast.error(getErrorMessage(error, "Unable to remove expense")); }
  };

  const handleRestore = async (expense: Expense) => {
    try {
      const response = await restoreMutation.mutateAsync(expense.id);
      toast.success("Expense restored");
      setDetails(response.data);
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
    } catch (error) { toast.error(getErrorMessage(error, "Unable to restore expense")); }
  };

  const hasValidAmountRange = filters.minAmount === "" || filters.maxAmount === "" || Number(filters.minAmount) <= Number(filters.maxAmount);
  const stagesForDetail = details?.stageId ? stageNames.get(details.stageId) ?? "Stage unavailable" : "";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
      <div className="space-y-1"><ExpenseHeader count={pagination?.total ?? expenses.length} onAdd={openCreate} /><p className="text-sm text-muted-foreground">Keep track of the extra costs that come up throughout your house build.</p></div>
      <ExpenseFilters {...filters} stages={stages} onChange={changeFilter} onClear={clearFilters} />
      {!hasValidAmountRange && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Minimum amount cannot be greater than maximum amount.</p>}
      {expensesQuery.isError ? <section className="rounded-2xl border border-destructive/30 bg-card p-6 text-center"><h2 className="font-semibold">Expenses could not be loaded</h2><p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(expensesQuery.error, "Check your connection and try again.")}</p><button type="button" onClick={() => void expensesQuery.refetch()} className="mt-4 min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Try again</button></section> : expensesQuery.isLoading ? <section aria-label="Loading expenses" className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-border bg-muted/40" />)}</section> : expenses.length === 0 ? <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"><span aria-hidden="true" className="text-xl">₹</span></span><h2 className="mt-4 text-base font-semibold">{filters.includeDeleted ? "No expenses found" : "No expenses yet"}</h2><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{Object.values(filters).some(Boolean) ? "No expenses match your filters. Clear them to see all expenses." : "Record transport, utilities, tools, and other costs from your house build."}</p>{Object.values(filters).some(Boolean) ? <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Clear filters</button> : <button type="button" onClick={openCreate} className="mt-4 min-h-11 rounded-xl bg-foreground px-4 text-sm font-semibold text-background">Add your first expense</button>}</section> : <>
        <section aria-label="Expenses" className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">{expenses.map((expense) => <ExpenseCard key={expense.id} expense={expense} stageName={expense.stageId ? stageNames.get(expense.stageId) ?? "Stage unavailable" : "No stage"} isRestoring={restoreMutation.isPending && restoreMutation.variables === expense.id} onDetails={setDetails} onEdit={openEdit} onDelete={setDeleting} onRestore={(item) => void handleRestore(item)} />)}</section>
        {pagination && pagination.totalPages > 1 && <nav aria-label="Expense pages" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"><p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} expenses</p><div className="flex gap-2"><button type="button" aria-label="Previous page" disabled={!pagination.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-medium disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Previous</button><button type="button" aria-label="Next page" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-medium disabled:opacity-50">Next<ChevronRight className="h-4 w-4" /></button></div></nav>}
      </>}
      {expensesQuery.isFetching && !expensesQuery.isLoading && <p aria-live="polite" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating expense results…</p>}
      <ExpenseFormDialog open={formOpen} expense={editing} stages={stages} currentUserId={user?.id ?? ""} optionsLoading={stagesQuery.isLoading} optionsError={stagesQuery.isError ? "Construction stages could not be loaded. Retry before saving." : undefined} isSubmitting={isSubmitting} onSubmit={handleSubmit} onClose={closeForm} />
      <ExpenseDeleteDialog expense={deleting} isDeleting={deleteMutation.isPending} onConfirm={() => void handleDelete()} onClose={() => { if (!deleteMutation.isPending) setDeleting(null); }} />
      <ExpenseDetailsDialog expense={details} stageName={stagesForDetail} currentUserId={user?.id ?? ""} isRestoring={restoreMutation.isPending} onClose={() => setDetails(null)} onEdit={openEdit} onDelete={(expense) => setDeleting(expense)} onRestore={(expense) => void handleRestore(expense)} />
    </main>
  );
}
