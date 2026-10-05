import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { supplierAgreementFormSchema, type SupplierAgreementFormValues } from "@/features/supplier-agreements/supplier-agreement.schema";
import { SUPPLIER_AGREEMENT_STATUS, type SupplierAgreement } from "@/features/supplier-agreements/supplier-agreement.types";
import { SUPPLIER_AGREEMENT_STATUS_LABELS } from "@/features/supplier-agreements/supplier-agreement.utils";
import type { Vendor } from "@/features/vendors/vendor.types";
import type { Material } from "@/features/materials/material.types";

interface Props { agreement: SupplierAgreement | null; vendors: Vendor[]; materials: Material[]; submitting: boolean; onSubmit: (values: SupplierAgreementFormValues) => void; onCancel: () => void }
const defaults: SupplierAgreementFormValues = { vendorId: "", materialIds: [], advanceAmount: 0, startDate: "", status: "ACTIVE", notes: "" };
const fieldClass = "h-11 w-full rounded-xl border bg-background px-3 font-normal";

export default function SupplierAgreementForm({ agreement, vendors, materials, submitting, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<SupplierAgreementFormValues>({ resolver: zodResolver(supplierAgreementFormSchema), defaultValues: defaults });
  const selectedIds = useWatch({ control, name: "materialIds" });
  const startDate = useWatch({ control, name: "startDate" });

  useEffect(() => {
    reset(agreement ? { vendorId: agreement.vendorId, materialIds: [...agreement.materialIds], advanceAmount: agreement.advanceAmount, startDate: agreement.startDate.slice(0, 10), status: agreement.status, notes: agreement.notes ?? "" } : defaults);
  }, [agreement, reset]);

  const toggleMaterial = (id: string, checked: boolean) => {
    const next = checked ? [...new Set([...selectedIds, id])] : selectedIds.filter((selectedId) => selectedId !== id);
    setValue("materialIds", next, { shouldDirty: true, shouldValidate: true });
  };
  const removeMaterial = (id: string) => setValue("materialIds", selectedIds.filter((selectedId) => selectedId !== id), { shouldDirty: true, shouldValidate: true });
  const selectedMaterials = selectedIds.map((id) => materials.find((material) => material._id === id)).filter((material): material is Material => Boolean(material));

  return <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium">Vendor<select {...register("vendorId")} className={fieldClass}><option value="">Select active material supplier</option>{vendors.filter((vendor) => vendor.type === "MATERIAL_SUPPLIER" && vendor.status === "ACTIVE" && !vendor.isDeleted).map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.name}</option>)}</select>{errors.vendorId && <span role="alert" className="block text-xs text-destructive">{errors.vendorId.message}</span>}</label>
      <label className="space-y-1.5 text-sm font-medium">Advance amount (₹)<input type="number" min="0" max="100000000" step="0.01" inputMode="decimal" {...register("advanceAmount")} className={fieldClass} />{errors.advanceAmount && <span role="alert" className="block text-xs text-destructive">{errors.advanceAmount.message}</span>}<span className="block text-xs font-normal text-muted-foreground">Enter the amount in rupees.</span></label>
      <div className="space-y-1.5 text-sm font-medium"><span>Start date</span><DatePicker value={startDate} onChange={(value) => setValue("startDate", value, { shouldValidate: true, shouldDirty: true })} ariaLabelledBy="supplier-agreement-form-title" />{errors.startDate && <span role="alert" className="block text-xs text-destructive">{errors.startDate.message}</span>}</div>
      <label className="space-y-1.5 text-sm font-medium">Status<select {...register("status")} className={fieldClass}>{Object.values(SUPPLIER_AGREEMENT_STATUS).map((status) => <option key={status} value={status}>{SUPPLIER_AGREEMENT_STATUS_LABELS[status]}</option>)}</select>{errors.status && <span role="alert" className="block text-xs text-destructive">{errors.status.message}</span>}</label>
    </div>
    <fieldset className="space-y-2"><legend className="text-sm font-medium">Materials</legend><div className="max-h-48 overflow-y-auto rounded-xl border p-2">{materials.filter((material) => !material.isDeleted).map((material) => <label key={material._id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted/60"><input type="checkbox" checked={selectedIds.includes(material._id)} onChange={(event) => toggleMaterial(material._id, event.target.checked)} className="h-4 w-4 accent-primary" /><span className="min-w-0 flex-1 truncate">{material.name}</span><span className="text-xs text-muted-foreground">{material.defaultUnit}</span></label>)}{materials.filter((material) => !material.isDeleted).length === 0 && <p className="p-3 text-sm text-muted-foreground">No active materials available.</p>}</div><div><p className="text-xs font-medium text-muted-foreground">Selected materials</p>{selectedMaterials.length ? <ul className="mt-2 flex flex-wrap gap-2">{selectedMaterials.map((material) => <li key={material._id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-xs text-primary"><span className="truncate">{material.name}</span><button type="button" aria-label={`Remove ${material.name}`} onClick={() => removeMaterial(material._id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-primary/15"><X className="h-3.5 w-3.5" /></button></li>)}</ul> : <p className="mt-1 text-sm text-muted-foreground">None selected</p>}</div>{errors.materialIds && <p role="alert" className="text-xs text-destructive">{errors.materialIds.message}</p>}</fieldset>
    <label className="block space-y-1.5 text-sm font-medium">Notes<textarea rows={3} maxLength={2000} {...register("notes")} className="w-full resize-y rounded-xl border bg-background p-3 font-normal" /><span className="block text-right text-xs font-normal text-muted-foreground">Maximum 2,000 characters</span>{errors.notes && <span role="alert" className="block text-xs text-destructive">{errors.notes.message}</span>}</label>
    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"><button type="button" disabled={submitting} onClick={onCancel} className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" disabled={submitting || vendors.every((vendor) => vendor.type !== "MATERIAL_SUPPLIER" || vendor.status !== "ACTIVE" || vendor.isDeleted) || materials.every((material) => material.isDeleted)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitting ? "Saving…" : agreement ? "Save Changes" : "Create Agreement"}</button></div>
  </form>;
}
