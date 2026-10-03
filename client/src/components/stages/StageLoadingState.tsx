import { LoaderCircle } from "lucide-react";

interface StageLoadingStateProps {
  count?: number;
}

export default function StageLoadingState({
  count = 4,
}: StageLoadingStateProps) {
  const skeletonItems = Array.from(
    { length: Math.max(1, count) },
    (_, index) => index,
  );

  return (
    <section
      aria-label="Loading construction stages"
      aria-busy="true"
      className="w-full space-y-3"
    >
      <div className="flex items-center gap-2">
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin text-muted-foreground"
        />

        <p className="text-sm font-medium text-muted-foreground">
          Loading construction stages...
        </p>
      </div>

      <div className="space-y-3">
        {skeletonItems.map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded-md bg-muted" />
                <div className="h-3 w-1/2 rounded-md bg-muted" />
              </div>

              <div className="h-10 w-10 shrink-0 rounded-xl bg-muted" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-6 w-24 rounded-full bg-muted" />
              <div className="h-6 w-28 rounded-full bg-muted" />
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded-md bg-muted" />
              <div className="h-3 w-4/5 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
