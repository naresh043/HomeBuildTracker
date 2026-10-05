import { Skeleton } from "@/components/ui/skeleton";

export default function SupplierAgreementLoadingState() {
  return <div role="status" aria-label="Loading supplier agreements" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-4 rounded-2xl border bg-card p-4"><div className="flex justify-between gap-3"><div className="w-2/3 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-4/5" /></div><Skeleton className="h-6 w-20 rounded-full" /></div><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-full" /></div>)}</div>;
}
