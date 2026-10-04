import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLoadingState() {
  return <div role="status" aria-label="Loading payments" className="grid grid-cols-1 gap-3 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-2xl border border-border bg-card p-4"><Skeleton className="h-4 w-36" /><Skeleton className="mt-3 h-5 w-2/3" /><Skeleton className="mt-2 h-4 w-1/2" /><Skeleton className="mt-6 h-14 w-full" /></div>)}</div>;
}
