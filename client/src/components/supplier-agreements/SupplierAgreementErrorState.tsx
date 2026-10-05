import { AlertCircle, RefreshCw } from "lucide-react";

interface Props { message: string; onRetry: () => void }
export default function SupplierAgreementErrorState({ message, onRetry }: Props) {
  return <section role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><div className="min-w-0 flex-1"><h2 className="font-semibold">Unable to load supplier agreements</h2><p className="mt-1 break-words text-sm text-muted-foreground">{message}</p><button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-background"><RefreshCw className="h-4 w-4" />Retry</button></div></div></section>;
}
