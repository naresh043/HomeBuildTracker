import { AlertCircle, RefreshCw } from "lucide-react";

export default function PaymentErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center"><AlertCircle className="mx-auto h-6 w-6 text-destructive" /><p className="mt-2 text-sm text-foreground">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted"><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</button></div>;
}
