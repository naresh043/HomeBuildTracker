import { X } from "lucide-react";
import SupplierAgreementForm from "./SupplierAgreementForm";
import type { SupplierAgreement } from "@/features/supplier-agreements/supplier-agreement.types";
import type { SupplierAgreementFormValues } from "@/features/supplier-agreements/supplier-agreement.schema";
import type { Vendor } from "@/features/vendors/vendor.types";
import type { Material } from "@/features/materials/material.types";

interface Props { open: boolean; agreement: SupplierAgreement | null; vendors: Vendor[]; materials: Material[]; submitting: boolean; onClose: () => void; onSubmit: (values: SupplierAgreementFormValues) => void }
export default function SupplierAgreementFormDialog({ open, agreement, vendors, materials, submitting, onClose, onSubmit }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="supplier-agreement-form-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl"><header className="mb-5 flex items-start justify-between gap-4"><div><h2 id="supplier-agreement-form-title" className="text-lg font-semibold">{agreement ? "Edit Supplier Agreement" : "Add Supplier Agreement"}</h2><p className="mt-1 text-sm text-muted-foreground">Set the supplier, materials, advance, and agreement terms.</p></div><button type="button" aria-label="Close dialog" disabled={submitting} onClick={onClose} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button></header><SupplierAgreementForm key={agreement?.id ?? "new"} agreement={agreement} vendors={vendors} materials={materials} submitting={submitting} onSubmit={onSubmit} onCancel={onClose} /></section></div>;
}
