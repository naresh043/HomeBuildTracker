import { Skeleton } from "@/components/ui/skeleton";

const VendorLoadingState = () => {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading vendors"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>

            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          </div>

          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorLoadingState;