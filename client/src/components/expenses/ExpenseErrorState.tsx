interface Props { message: string; onRetry: () => void }

export default function ExpenseErrorState({ message, onRetry }: Props) {
  return (
    <section role="alert" className="rounded-2xl border border-destructive/30 bg-card p-6 text-center">
      <h2 className="font-semibold">Expenses could not be loaded</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">Try again</button>
    </section>
  );
}
