import { ClipboardList, Plus } from "lucide-react";

interface MaterialReceiptEmptyStateProps { hasFilters: boolean; onAdd: () => void; onClear: () => void; }

export default function MaterialReceiptEmptyState({ hasFilters, onAdd, onClear }: MaterialReceiptEmptyStateProps) {
  return <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"><ClipboardList className="h-6 w-6 text-muted-foreground" /></span><h2 className="mt-4 text-base font-semibold">{hasFilters ? "No receipts match these filters" : "No material receipts yet"}</h2><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{hasFilters ? "Try changing or clearing the filters." : "Record materials as they arrive at the construction site."}</p><div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">{hasFilters ? <button type="button" onClick={onClear} className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Clear filters</button> : <button type="button" onClick={onAdd} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background"><Plus className="h-4 w-4" />Add first receipt</button>}</div></section>;
}
