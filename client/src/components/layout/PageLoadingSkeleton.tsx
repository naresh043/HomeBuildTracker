import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoadingSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
      role="status"
      aria-label="Loading page"
    >
      {/* Page heading */}
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-8 w-56 sm:h-9 sm:w-72" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      {/* Main content */}
      <Skeleton className="h-64 rounded-2xl" />

      {/* Activity */}
      <Skeleton className="h-48 rounded-2xl" />

      <span className="sr-only">Loading content...</span>
    </div>
  );
}
