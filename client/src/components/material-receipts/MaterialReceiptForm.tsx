import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { DatePicker } from "@/components/ui/date-picker";
import type { Material } from "@/features/materials/material.types";
import { MATERIAL_UNIT } from "@/features/materials/material.types";
import type { MaterialReceipt } from "@/features/material-receipts/material-receipt.types";
import { MATERIAL_RECEIPT_UNIT_LABELS, formatReceiptCurrency } from "@/features/material-receipts/material-receipt.utils";
import { materialReceiptFormSchema, type MaterialReceiptFormValues } from "@/features/material-receipts/material-receipt.schema";
import type { ConstructionStage } from "@/features/stages/stage.types";
import type { Vendor } from "@/features/vendors/vendor.types";

interface Props {
  receipt?: MaterialReceipt | null;
  vendors: Vendor[];
  materials: Material[];
  stages: ConstructionStage[];
  optionsLoading: boolean;
  isSubmitting: boolean;
  optionsError?: string;
  onSubmit: (values: MaterialReceiptFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const inputClass = "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export default function MaterialReceiptForm({ receipt = null, vendors, materials, stages, optionsLoading, isSubmitting, optionsError, onSubmit, onCancel }: Props) {
  const form = useForm<MaterialReceiptFormValues>({
    resolver: zodResolver(materialReceiptFormSchema),
    defaultValues: {
      vendorId: receipt?.vendorId ?? "",
      materialId: receipt?.materialId ?? "",
      stageId: receipt?.stageId ?? "",
      date: receipt?.date.slice(0, 10) ?? "",
      quantity: receipt?.quantity ?? 1,
      unit: receipt?.unit ?? MATERIAL_UNIT.BAG,
      unitPrice: receipt?.unitPrice ?? 0,
      notes: receipt?.notes ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      vendorId: receipt?.vendorId ?? "",
      materialId: receipt?.materialId ?? "",
      stageId: receipt?.stageId ?? "",
      date: receipt?.date.slice(0, 10) ?? "",
      quantity: receipt?.quantity ?? 1,
      unit: receipt?.unit ?? MATERIAL_UNIT.BAG,
      unitPrice: receipt?.unitPrice ?? 0,
      notes: receipt?.notes ?? "",
    });
  }, [form, receipt]);

  const selectedMaterialId = useWatch({ control: form.control, name: "materialId" });
  const quantity = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const unitPrice = Number(useWatch({ control: form.control, name: "unitPrice" })) || 0;
  const selectedMaterial = materials.find(material => material._id === selectedMaterialId);
  const errors = form.formState.errors;
  const selectError = (message?: string) => message && <p className="mt-1 text-xs text-destructive">{message}</p>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {optionsError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{optionsError}</p>}
      {([
        ["vendorId", "Vendor", vendors.map(item => ({ id: item._id, label: `${item.name}${item.isDeleted ? " (deleted)" : item.status === "INACTIVE" ? " (inactive)" : ""}` })), "Select a vendor"],
        ["materialId", "Material", materials.map(item => ({ id: item._id, label: `${item.name} · ${item.category}` })), "Select a material"],
        ["stageId", "Construction stage", stages.map(item => ({ id: item._id, label: item.name })), "Select a stage"],
      ] as const).map(([name, label, options, placeholder]) => (
        <div key={name}>
          <label htmlFor={`receipt-${name}`} className={labelClass}>{label} <span className="text-destructive" aria-hidden="true">*</span></label>
          <select
            id={`receipt-${name}`}
            disabled={isSubmitting || optionsLoading}
            className={inputClass}
            {...form.register(name, {
              onChange: name === "materialId" ? event => {
                const material = materials.find(item => item._id === event.target.value);
                if (material) form.setValue("unit", material.defaultUnit, { shouldDirty: true, shouldValidate: true });
              } : undefined,
            })}
          >
            <option value="">{optionsLoading ? "Loading..." : options.length ? placeholder : `No ${label.toLowerCase()} available`}</option>
            {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          {selectError(errors[name]?.message)}
        </div>
      ))}

      <div>
        <span id="receipt-date-label" className={labelClass}>Date <span className="text-destructive" aria-hidden="true">*</span></span>
        <Controller name="date" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} placeholder="Choose receipt date" ariaLabelledBy="receipt-date-label" />} />
        {selectError(errors.date?.message)}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="receipt-quantity" className={labelClass}>Quantity <span className="text-destructive" aria-hidden="true">*</span></label>
          <input id="receipt-quantity" type="number" min="0.001" max="1000000000" step="any" inputMode="decimal" disabled={isSubmitting} className={inputClass} {...form.register("quantity", { valueAsNumber: true })} />
          {selectError(errors.quantity?.message)}
        </div>
        <div>
          <label htmlFor="receipt-unit" className={labelClass}>Unit <span className="text-destructive" aria-hidden="true">*</span></label>
          <select id="receipt-unit" disabled={isSubmitting} className={inputClass} {...form.register("unit")}>
            {Object.values(MATERIAL_UNIT).map(unit => <option key={unit} value={unit}>{MATERIAL_RECEIPT_UNIT_LABELS[unit]}</option>)}
          </select>
          {selectedMaterial && <p className="mt-1 text-xs text-muted-foreground">Default for {selectedMaterial.name}: {MATERIAL_RECEIPT_UNIT_LABELS[selectedMaterial.defaultUnit]}</p>}
          {selectError(errors.unit?.message)}
        </div>
      </div>

      <div>
        <label htmlFor="receipt-unit-price" className={labelClass}>Unit price (₹) <span className="text-destructive" aria-hidden="true">*</span></label>
        <input id="receipt-unit-price" type="number" min="0" max="100000000" step="any" inputMode="decimal" disabled={isSubmitting} className={inputClass} {...form.register("unitPrice", { valueAsNumber: true })} />
        {selectError(errors.unitPrice?.message)}
      </div>

      <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Estimated total: <span className="font-semibold text-foreground">{formatReceiptCurrency(quantity * unitPrice)}</span><span className="ml-1 text-xs">(final total comes from the server)</span></p>

      <div>
        <label htmlFor="receipt-notes" className={labelClass}>Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
        <textarea id="receipt-notes" rows={3} maxLength={1000} placeholder="Delivery notes, grade, or other details" disabled={isSubmitting} className={`${inputClass} resize-y py-3`} {...form.register("notes")} />
        {selectError(errors.notes?.message)}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting || optionsLoading || !vendors.length || !materials.length || !stages.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{isSubmitting ? "Saving..." : receipt ? "Save changes" : "Add receipt"}
        </button>
      </div>
    </form>
  );
}
