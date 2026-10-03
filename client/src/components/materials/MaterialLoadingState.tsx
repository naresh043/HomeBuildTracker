import { Skeleton } from "@/components/ui/skeleton";

const MATERIAL_SKELETON_COUNT = 6;

export default function MaterialLoadingState() {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading materials"
    >
      {Array.from({ length: MATERIAL_SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}