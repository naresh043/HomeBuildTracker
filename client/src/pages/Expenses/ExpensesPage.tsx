import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ExpenseDeleteDialog from "@/components/expenses/ExpenseDeleteDialog";
import ExpenseDetailsDialog from "@/components/expenses/ExpenseDetailsDialog";
import ExpenseEmptyState from "@/components/expenses/ExpenseEmptyState";
import ExpenseErrorState from "@/components/expenses/ExpenseErrorState";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseFormDialog from "@/components/expenses/ExpenseFormDialog";
import ExpenseHeader from "@/components/expenses/ExpenseHeader";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseLoadingState from "@/components/expenses/ExpenseLoadingState";
import ExpensePagination from "@/components/expenses/ExpensePagination";

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useRestoreExpenseMutation,
  useUpdateExpenseMutation,
} from "@/features/expenses/expense.mutations";

import {
  expenseQueryKeys,
  useExpensesQuery,
} from "@/features/expenses/expense.queries";

import type { ExpenseFormValues } from "@/features/expenses/expense.schema";

import type {
  Expense,
  ExpenseCategory,
  ExpenseMethod,
  ExpenseQueryParams,
} from "@/features/expenses/expense.types";

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

const EMPTY_FILTERS: FilterState = {
  search: "",
  category: "",
  method: "",
  stageId: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  hasReceipt: "",
  includeDeleted: false,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

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

  /*
   * Build API query parameters.
   *
   * includeDeleted is sent to the backend only when the
   * deleted-items mode is enabled.
   */
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

    hasReceipt:
      filters.hasReceipt === "" ? undefined : filters.hasReceipt === "true",

    includeDeleted: filters.includeDeleted ? true : undefined,
  };

  /*
   * Validate amount range before executing the query.
   */
  const hasValidAmountRange =
    filters.minAmount === "" ||
    filters.maxAmount === "" ||
    Number(filters.minAmount) <= Number(filters.maxAmount);

  /*
   * Determine whether the user currently has any active filter.
   */
  const hasActiveFilters = Boolean(
    filters.search.trim() ||
    filters.category ||
    filters.method ||
    filters.stageId ||
    filters.fromDate ||
    filters.toDate ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.hasReceipt ||
    filters.includeDeleted,
  );

  const expensesQuery = useExpensesQuery(params, hasValidAmountRange);

  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();
  const restoreMutation = useRestoreExpenseMutation();

  /*
   * IMPORTANT:
   *
   * The backend's includeDeleted option allows deleted records
   * to be returned.
   *
   * We intentionally filter the response on the frontend:
   *
   * includeDeleted = false
   *   -> show ONLY active expenses
   *
   * includeDeleted = true
   *   -> show ONLY deleted expenses
   *
   * This matches the Material Receipts behavior.
   */
  const expenses = useMemo(() => {
    const items = expensesQuery.data?.data.items ?? [];

    if (!filters.includeDeleted) {
      return items.filter((expense) => !expense.isDeleted);
    }

    return items.filter((expense) => expense.isDeleted);
  }, [expensesQuery.data?.data.items, filters.includeDeleted]);

  const pagination = expensesQuery.data?.data.pagination;

  const stages = useMemo(
    () => stagesQuery.data?.data ?? [],
    [stagesQuery.data?.data],
  );

  const stageNames = useMemo(
    () =>
      new Map(
        stages.map((stage) => [
          stage._id,
          `${stage.name}${stage.isDeleted ? " (deleted)" : ""}`,
        ]),
      ),
    [stages],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  /*
   * If the current page becomes invalid after deletion/filtering,
   * move back to the last valid page.
   */
  useEffect(() => {
    if (
      !expensesQuery.isSuccess ||
      !pagination ||
      page <= Math.max(1, pagination.totalPages)
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPage(Math.max(1, pagination.totalPages));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [expensesQuery.isSuccess, page, pagination]);

  /*
   * Change one filter and always return to page 1.
   */
  const changeFilter = (key: string, value: string | boolean) => {
    setFilters(
      (previous) =>
        ({
          ...previous,
          [key]: value,
        }) as FilterState,
    );

    setPage(1);
  };

  /*
   * Reset all filters.
   */
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setDetails(null);
    setEditing(expense);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (!isSubmitting) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  /*
   * Create / update expense.
   */
  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!user?.id) {
      toast.error("Your session could not be identified. Sign in again.");
      return;
    }

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

          ...(values.stageId
            ? {
                stageId: values.stageId,
              }
            : {}),

          ...(values.notes.trim()
            ? {
                notes: values.notes.trim(),
              }
            : {}),
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

  /*
   * Soft delete.
   */
  const handleDelete = async () => {
    if (!deleting) {
      return;
    }

    try {
      const response = await deleteMutation.mutateAsync(deleting.id);

      setDeleting(null);
      setDetails(null);

      toast("Expense removed from the active list", {
        action: {
          label: "Restore",
          onClick: () => {
            void handleRestore(response.data);
          },
        },
        duration: 10000,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove expense"));
    }
  };

  /*
   * Restore deleted expense.
   */
  const handleRestore = async (expense: Expense) => {
    try {
      const response = await restoreMutation.mutateAsync(expense.id);

      toast.success("Expense restored");

      setDetails(response.data);

      void queryClient.invalidateQueries({
        queryKey: expenseQueryKeys.all,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to restore expense"));
    }
  };

  const stagesForDetail = details?.stageId
    ? (stageNames.get(details.stageId) ?? "Stage unavailable")
    : "";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
      <div className="space-y-1">
        <ExpenseHeader
          count={pagination?.total ?? expenses.length}
          onAdd={openCreate}
        />

        <p className="text-sm text-muted-foreground">
          Keep track of the extra costs that come up throughout your house
          build.
        </p>
      </div>

      <ExpenseFilters
        {...filters}
        stages={stages}
        onChange={changeFilter}
        onClear={clearFilters}
      />

      {!hasValidAmountRange && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          Minimum amount cannot be greater than maximum amount.
        </p>
      )}

      {!hasValidAmountRange ? (
        <ExpenseEmptyState
          hasExpenses
          onAdd={openCreate}
          onClear={clearFilters}
        />
      ) : expensesQuery.isError ? (
        <ExpenseErrorState
          message={getErrorMessage(
            expensesQuery.error,
            "Check your connection and try again.",
          )}
          onRetry={() => {
            void expensesQuery.refetch();
          }}
        />
      ) : expensesQuery.isLoading ? (
        <ExpenseLoadingState />
      ) : expenses.length === 0 ? (
        <ExpenseEmptyState
          hasExpenses={hasActiveFilters || (pagination?.total ?? 0) > 0}
          onAdd={openCreate}
          onClear={clearFilters}
        />
      ) : (
        <>
          <ExpenseList
            expenses={expenses}
            stageNames={stageNames}
            restoringId={
              restoreMutation.isPending ? restoreMutation.variables : undefined
            }
            onDetails={setDetails}
            onEdit={openEdit}
            onDelete={setDeleting}
            onRestore={(item) => {
              void handleRestore(item);
            }}
          />

          {pagination && (
            <ExpensePagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}

      {expensesQuery.isFetching && !expensesQuery.isLoading && (
        <p
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating expense results…
        </p>
      )}

      <ExpenseFormDialog
        open={formOpen}
        expense={editing}
        stages={stages}
        currentUserId={user?.id ?? ""}
        optionsLoading={stagesQuery.isLoading}
        optionsError={
          stagesQuery.isError
            ? "Construction stages could not be loaded. Retry before saving."
            : undefined
        }
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />

      <ExpenseDeleteDialog
        expense={deleting}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          void handleDelete();
        }}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleting(null);
          }
        }}
      />

      <ExpenseDetailsDialog
        expense={details}
        stageName={stagesForDetail}
        currentUserId={user?.id ?? ""}
        isRestoring={restoreMutation.isPending}
        onClose={() => setDetails(null)}
        onEdit={openEdit}
        onDelete={(expense) => {
          setDeleting(expense);
        }}
        onRestore={(expense) => {
          void handleRestore(expense);
        }}
      />
    </main>
  );
}
