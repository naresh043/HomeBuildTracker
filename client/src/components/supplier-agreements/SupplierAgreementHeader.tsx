import { FileSignature, Plus } from "lucide-react";

interface Props { count: number; onAdd: () => void }

export default function SupplierAgreementHeader({ count, onAdd }: Props) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileSignature className="h-5 w-5" aria-hidden="true" /></div><div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight">Supplier Agreements</h1><p className="mt-0.5 text-sm text-muted-foreground">{count} {count === 1 ? "agreement" : "agreements"} on this page</p></div></div><button type="button" onClick={onAdd} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"><Plus className="h-4 w-4" aria-hidden="true" />Add Supplier Agreement</button></header>;
}
