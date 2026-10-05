import { Filter, Search, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_METHOD_LABELS,
} from "@/features/expenses/expense.utils";
import type {
  ExpenseCategory,
  ExpenseMethod,
} from "@/features/expenses/expense.types";
import type { ConstructionStage } from "@/features/stages/stage.types";

interface Props {
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
  stages: ConstructionStage[];
  onChange: (key: string, value: string | boolean) => void;
  onClear: () => void;
}

const controlClass =
  "min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export default function ExpenseFilters(props: Props) {
  const active = Boolean(
    props.search.trim() || props.category || props.method || props.stageId ||
      props.fromDate || props.toDate || props.minAmount || props.maxAmount ||
      props.hasReceipt || props.includeDeleted,
  );
  const from = props.fromDate ? new Date(`${props.fromDate}T00:00:00`) : undefined;
  const to = props.toDate ? new Date(`${props.toDate}T00:00:00`) : undefined;

  return (
    <section aria-label="Expense filters" className="w-full min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted"><Filter className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0"><h2 className="text-sm font-semibold">Find expenses</h2><p className="text-xs text-muted-foreground">Search notes and narrow by expense details.</p></div>
        </div>
        {active && <button type="button" onClick={props.onClear} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" aria-hidden="true" />Clear</button>}
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="expense-search" className="mb-1.5 block text-xs font-medium">Search notes</label>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="expense-search" type="search" maxLength={100} value={props.search} onChange={(e) => props.onChange("search", e.target.value)} placeholder="e.g. Sand transportation" className={`${controlClass} pl-10`} /></div>
        </div>
        <div><label htmlFor="expense-category-filter" className="mb-1.5 block text-xs font-medium">Category</label><select id="expense-category-filter" value={props.category} onChange={(e) => props.onChange("category", e.target.value)} className={controlClass}><option value="">All categories</option>{Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="expense-method-filter" className="mb-1.5 block text-xs font-medium">Payment method</label><select id="expense-method-filter" value={props.method} onChange={(e) => props.onChange("method", e.target.value)} className={controlClass}><option value="">All methods</option>{Object.entries(EXPENSE_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="expense-stage-filter" className="mb-1.5 block text-xs font-medium">Construction stage</label><select id="expense-stage-filter" value={props.stageId} onChange={(e) => props.onChange("stageId", e.target.value)} className={controlClass}><option value="">All stages</option>{props.stages.filter((stage) => !stage.isDeleted).map((stage) => <option key={stage._id} value={stage._id}>{stage.name}</option>)}</select></div>
        <div><label id="expense-from-label" className="mb-1.5 block text-xs font-medium">From date</label><DatePicker value={props.fromDate} onChange={(value) => props.onChange("fromDate", value)} maxDate={to} ariaLabelledBy="expense-from-label" placeholder="Start date" /></div>
        <div><label id="expense-to-label" className="mb-1.5 block text-xs font-medium">To date</label><DatePicker value={props.toDate} onChange={(value) => props.onChange("toDate", value)} minDate={from} ariaLabelledBy="expense-to-label" placeholder="End date" /></div>
        <div><label htmlFor="expense-receipt-filter" className="mb-1.5 block text-xs font-medium">Receipt</label><select id="expense-receipt-filter" value={props.hasReceipt} onChange={(e) => props.onChange("hasReceipt", e.target.value)} className={controlClass}><option value="">Any receipt</option><option value="true">Has receipt</option><option value="false">No receipt</option></select></div>
        <div><label htmlFor="expense-min-amount" className="mb-1.5 block text-xs font-medium">Minimum amount (₹)</label><input id="expense-min-amount" type="number" min="0" step="0.01" inputMode="decimal" value={props.minAmount} onChange={(e) => props.onChange("minAmount", e.target.value)} className={controlClass} placeholder="Any" /></div>
        <div><label htmlFor="expense-max-amount" className="mb-1.5 block text-xs font-medium">Maximum amount (₹)</label><input id="expense-max-amount" type="number" min="0" step="0.01" inputMode="decimal" value={props.maxAmount} onChange={(e) => props.onChange("maxAmount", e.target.value)} className={controlClass} placeholder="Any" /></div>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2 lg:col-span-3"><span><span className="block text-sm font-medium">Include deleted expenses</span><span className="block text-xs text-muted-foreground">Deleted records are marked and can be restored.</span></span><input type="checkbox" checked={props.includeDeleted} onChange={(e) => props.onChange("includeDeleted", e.target.checked)} className="h-5 w-5 shrink-0 accent-foreground" /></label>
      </div>
    </section>
  );
}
