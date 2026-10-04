import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { expenseSchema, type ExpenseFormValues } from "@/features/expenses/expense.schema";
import type { Expense } from "@/features/expenses/expense.types";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_METHOD_LABELS } from "@/features/expenses/expense.utils";
import type { ConstructionStage } from "@/features/stages/stage.types";

interface Props {
  open: boolean;
  expense: Expense | null;
  stages: ConstructionStage[];
  currentUserId: string;
  optionsLoading: boolean;
  optionsError?: string;
  isSubmitting: boolean;
  onSubmit: (values: ExpenseFormValues) => void | Promise<void>;
  onClose: () => void;
}

const controlClass = "min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground";

export default function ExpenseFormDialog({ open, expense, stages, currentUserId, optionsLoading, optionsError, isSubmitting, onSubmit, onClose }: Props) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    values: expense ? {
      date: expense.date.slice(0, 10), amount: expense.amount, category: expense.category,
      method: expense.method, stageId: expense.stageId ?? "", notes: expense.notes ?? "",
    } : { date: new Date().toISOString().slice(0, 10), amount: 0, category: "MISC", method: "CASH", stageId: "", notes: "" },
  });
  const notesLength = useWatch({ control: form.control, name: "notes" })?.length ?? 0;
  if (!open) return null;
  const errors = form.formState.errors;
  const error = (message?: string) => message ? <p role="alert" className="mt-1 text-xs text-destructive">{message}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="expense-form-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-xl sm:rounded-2xl">
        <header className="mb-5 flex items-start justify-between gap-4"><div><h2 id="expense-form-title" className="text-lg font-semibold">{expense ? "Edit expense" : "Add expense"}</h2><p className="mt-1 text-sm text-muted-foreground">Record a cost related to your house construction.</p></div><button type="button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button></header>
        {optionsError && <p role="alert" className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{optionsError}</p>}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label id="expense-date-label" className={labelClass}>Date <span className="text-destructive" aria-hidden="true">*</span></label><Controller name="date" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} placeholder="Choose expense date" ariaLabelledBy="expense-date-label" />} />{error(errors.date?.message)}</div>
            <div><label htmlFor="expense-amount" className={labelClass}>Amount (₹) <span className="text-destructive" aria-hidden="true">*</span></label><input id="expense-amount" type="number" min="0.01" max="100000000" step="0.01" inputMode="decimal" disabled={isSubmitting} className={controlClass} placeholder="e.g. 2500" {...form.register("amount", { valueAsNumber: true })} />{error(errors.amount?.message)}</div>
            <div><label htmlFor="expense-category" className={labelClass}>Category <span className="text-destructive" aria-hidden="true">*</span></label><select id="expense-category" disabled={isSubmitting} className={controlClass} {...form.register("category")}>{Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{error(errors.category?.message)}</div>
            <div><label htmlFor="expense-method" className={labelClass}>Payment method <span className="text-destructive" aria-hidden="true">*</span></label><select id="expense-method" disabled={isSubmitting} className={controlClass} {...form.register("method")}>{Object.entries(EXPENSE_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{error(errors.method?.message)}</div>
          </div>
          <div><label htmlFor="expense-stage" className={labelClass}>Construction stage <span className="text-xs font-normal text-muted-foreground">(optional)</span></label><select id="expense-stage" disabled={isSubmitting || optionsLoading} className={controlClass} {...form.register("stageId")}><option value="">No stage selected</option>{stages.filter((stage) => !stage.isDeleted || stage._id === expense?.stageId).map((stage) => <option key={stage._id} value={stage._id}>{stage.name}{stage.isDeleted ? " (deleted)" : ""}</option>)}</select>{error(errors.stageId?.message)}<p className="mt-1 text-xs text-muted-foreground">{optionsLoading ? "Loading construction stages…" : stages.length ? "Link this expense to a stage if it applies." : "No construction stages are available yet."}</p></div>
          <div><label htmlFor="expense-notes" className={labelClass}>Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></label><textarea id="expense-notes" rows={3} maxLength={1000} disabled={isSubmitting} className={`${controlClass} resize-y py-3`} placeholder="Add a short description" {...form.register("notes")} />{error(errors.notes?.message)}<p className="mt-1 text-right text-xs text-muted-foreground">{notesLength}/1000</p></div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" disabled={isSubmitting || optionsLoading || !currentUserId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{isSubmitting ? "Saving…" : expense ? "Save changes" : "Add expense"}</button></div>
        </form>
      </section>
    </div>
  );
}
