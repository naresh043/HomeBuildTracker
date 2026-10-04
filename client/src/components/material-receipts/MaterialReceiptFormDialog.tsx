import { X } from "lucide-react";
import type { Material } from "@/features/materials/material.types";
import type { MaterialReceipt } from "@/features/material-receipts/material-receipt.types";
import type { MaterialReceiptFormValues } from "@/features/material-receipts/material-receipt.schema";
import type { ConstructionStage } from "@/features/stages/stage.types";
import type { Vendor } from "@/features/vendors/vendor.types";
import MaterialReceiptForm from "./MaterialReceiptForm";

interface Props {
  open: boolean;
  receipt: MaterialReceipt | null;
  vendors: Vendor[];
  materials: Material[];
  stages: ConstructionStage[];
  optionsLoading: boolean;
  isSubmitting: boolean;
  optionsError?: string;
  onSubmit: (values: MaterialReceiptFormValues) => void | Promise<void>;
  onClose: () => void;
}

export default function MaterialReceiptFormDialog({ open, receipt, vendors, materials, stages, optionsLoading, isSubmitting, optionsError, onSubmit, onClose }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="receipt-form-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-xl sm:rounded-2xl"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="receipt-form-title" className="text-lg font-semibold">{receipt ? `Edit ${receipt.receiptNo}` : "Record material receipt"}</h2><p className="mt-1 text-sm text-muted-foreground">Record materials received on site. Payments are tracked separately.</p></div><button type="button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button></div><MaterialReceiptForm receipt={receipt} vendors={vendors} materials={materials} stages={stages} optionsLoading={optionsLoading} isSubmitting={isSubmitting} optionsError={optionsError} onSubmit={onSubmit} onCancel={onClose} /></div></div>;
}
