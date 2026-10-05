import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SupplierAgreementPagination as Pagination } from "@/features/supplier-agreements/supplier-agreement.types";

interface Props { pagination: Pagination; onPageChange: (page: number) => void }
export default function SupplierAgreementPagination({ pagination, onPageChange }: Props) {
  if (pagination.pages <= 1) return null;
  return <nav aria-label="Supplier Agreement pages" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3"><p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages} · {pagination.total} agreements</p><div className="flex gap-2"><button type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(Math.max(1, pagination.page - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border px-3 text-sm disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Previous</button><button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border px-3 text-sm disabled:opacity-50">Next<ChevronRight className="h-4 w-4" /></button></div></nav>;
}
