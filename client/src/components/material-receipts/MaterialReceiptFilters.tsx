import { Filter, Search, X } from "lucide-react";

import type { Material } from "@/features/materials/material.types";
import type { ConstructionStage } from "@/features/stages/stage.types";
import type { Vendor } from "@/features/vendors/vendor.types";
import { MATERIAL_RECEIPT_VERIFICATION_STATUS, type MaterialReceiptVerificationStatus } from "@/features/material-receipts/material-receipt.types";

interface MaterialReceiptFiltersProps {
  search: string;
  vendorId: string;
  materialId: string;
  stageId: string;
  verificationStatus: MaterialReceiptVerificationStatus | "";
  fromDate: string;
  toDate: string;
  includeDeleted: boolean;
  vendors: Vendor[];
  materials: Material[];
  stages: ConstructionStage[];
  onSearchChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onMaterialChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onStatusChange: (value: MaterialReceiptVerificationStatus | "") => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onIncludeDeletedChange: (value: boolean) => void;
  onClear: () => void;
}

const selectClass = "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export default function MaterialReceiptFilters(props: MaterialReceiptFiltersProps) {
  const hasFilters = Boolean(props.search.trim() || props.vendorId || props.materialId || props.stageId || props.verificationStatus || props.fromDate || props.toDate || props.includeDeleted);
  return (
    <section aria-label="Material receipt filters" className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"><Filter className="h-4 w-4" aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold text-foreground">Find receipts</h2><p className="text-xs text-muted-foreground">Search and narrow by supplier, material, stage or date.</p></div>
        </div>
        {hasFilters && <button type="button" onClick={props.onClear} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" />Clear</button>}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="receipt-search" className="mb-1.5 block text-xs font-medium">Search receipt number</label>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="receipt-search" type="search" value={props.search} onChange={e => props.onSearchChange(e.target.value)} placeholder="e.g. MR-0001" className={`${selectClass} pl-10`} /></div>
        </div>
        <div><label htmlFor="receipt-vendor" className="mb-1.5 block text-xs font-medium">Vendor</label><select id="receipt-vendor" value={props.vendorId} onChange={e => props.onVendorChange(e.target.value)} className={selectClass}><option value="">All vendors</option>{props.vendors.map(v => <option key={v._id} value={v._id}>{v.name}{v.isDeleted ? " (deleted)" : v.status === "INACTIVE" ? " (inactive)" : ""}</option>)}</select></div>
        <div><label htmlFor="receipt-material" className="mb-1.5 block text-xs font-medium">Material</label><select id="receipt-material" value={props.materialId} onChange={e => props.onMaterialChange(e.target.value)} className={selectClass}><option value="">All materials</option>{props.materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
        <div><label htmlFor="receipt-stage" className="mb-1.5 block text-xs font-medium">Construction stage</label><select id="receipt-stage" value={props.stageId} onChange={e => props.onStageChange(e.target.value)} className={selectClass}><option value="">All stages</option>{props.stages.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
        <div><label htmlFor="receipt-status" className="mb-1.5 block text-xs font-medium">Verification</label><select id="receipt-status" value={props.verificationStatus} onChange={e => props.onStatusChange(e.target.value as MaterialReceiptVerificationStatus | "")} className={selectClass}><option value="">All statuses</option><option value={MATERIAL_RECEIPT_VERIFICATION_STATUS.NEEDS_VERIFICATION}>Needs verification</option><option value={MATERIAL_RECEIPT_VERIFICATION_STATUS.VERIFIED}>Verified</option></select></div>
        <div><label htmlFor="receipt-from-date" className="mb-1.5 block text-xs font-medium">From date</label><input id="receipt-from-date" type="date" value={props.fromDate} max={props.toDate || undefined} onChange={e => props.onFromDateChange(e.target.value)} className={selectClass} /></div>
        <div><label htmlFor="receipt-to-date" className="mb-1.5 block text-xs font-medium">To date</label><input id="receipt-to-date" type="date" value={props.toDate} min={props.fromDate || undefined} onChange={e => props.onToDateChange(e.target.value)} className={selectClass} /></div>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2 lg:col-span-3">
          <span><span className="block text-sm font-medium">Include deleted receipts</span><span className="block text-xs text-muted-foreground">Deleted records are marked and can be restored.</span></span>
          <input type="checkbox" checked={props.includeDeleted} onChange={e => props.onIncludeDeletedChange(e.target.checked)} className="h-5 w-5 shrink-0 accent-foreground" />
        </label>
      </div>
    </section>
  );
}
