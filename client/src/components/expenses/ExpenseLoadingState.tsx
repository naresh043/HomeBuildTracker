export default function ExpenseLoadingState() {
  return (
    <section aria-label="Loading expenses" aria-busy="true" className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-border bg-muted/40" />)}
    </section>
  );
}
