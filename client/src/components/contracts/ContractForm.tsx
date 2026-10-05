import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, X } from "lucide-react";
import { contractFormSchema, type ContractFormValues } from "@/features/contracts/contract.schema";
import { CONTRACT_RATE_UNIT, CONTRACT_STATUS, CONTRACT_TYPE, type Contract } from "@/features/contracts/contract.types";
import type { Vendor } from "@/features/vendors/vendor.types";
import { formatContractCurrency } from "@/features/contracts/contract.utils";
import { DatePicker } from "@/components/ui/date-picker";
interface Props { contract: Contract | null; vendors: Vendor[]; submitting: boolean; onSubmit: (values: ContractFormValues) => void; onCancel: () => void }
export default function ContractForm({ contract, vendors, submitting, onSubmit, onCancel }: Props) {
 const [included, setIncluded] = useState(""); const [excluded, setExcluded] = useState("");
 const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<ContractFormValues>({ resolver: zodResolver(contractFormSchema), defaultValues: { vendorId: "", contractType: "CONSTRUCTION", rate: 0, rateUnit: "SQUARE", measurement: "", advanceAmount: 0, scopeIncluded: [], scopeExcluded: [], startDate: "", status: "ACTIVE", notes: "" } });
 const rate = Number(useWatch({ control, name: "rate" })) || 0; const measurementValue = useWatch({ control, name: "measurement" }); const measurement = Number(measurementValue) || 0; const rateUnit = useWatch({ control, name: "rateUnit" }); const scopesIncluded = useWatch({ control, name: "scopeIncluded" }); const scopesExcluded = useWatch({ control, name: "scopeExcluded" }); const startDate = useWatch({ control, name: "startDate" });
 useEffect(() => { reset(contract ? { vendorId: contract.vendorId, contractType: contract.contractType, rate: contract.rate, rateUnit: contract.rateUnit, measurement: contract.measurement ?? "", advanceAmount: contract.advanceAmount, scopeIncluded: contract.scopeIncluded, scopeExcluded: contract.scopeExcluded, startDate: contract.startDate.slice(0, 10), status: contract.status, notes: contract.notes ?? "" } : { vendorId: "", contractType: "CONSTRUCTION", rate: 0, rateUnit: "SQUARE", measurement: "", advanceAmount: 0, scopeIncluded: [], scopeExcluded: [], startDate: "", status: "ACTIVE", notes: "" }); }, [contract, reset]);
 const addScope = (kind: "scopeIncluded" | "scopeExcluded", value: string, current: string[], clear: () => void) => { const item = value.trim(); if (item && !current.includes(item) && current.length < 100) { setValue(kind, [...current, item], { shouldDirty: true }); clear(); } };
 return <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Vendor
              <select
                {...register("vendorId")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              >
                <option value="">Select active vendor</option>
                {vendors.filter((v) => v.status === "ACTIVE" && !v.isDeleted).map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <span className="block text-xs text-destructive">
                  {errors.vendorId.message}
                </span>
              )}
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Contract type
              <select
                {...register("contractType")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              >
                {Object.values(CONTRACT_TYPE).map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Rate (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                {...register("rate")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              />
              {errors.rate && (
                <span className="block text-xs text-destructive">
                  {errors.rate.message}
                </span>
              )}
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Rate unit
              <select
                {...register("rateUnit")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              >
                {Object.values(CONTRACT_RATE_UNIT).map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            {rateUnit !== "LUMP_SUM" && (
              <label className="space-y-1.5 text-sm font-medium">
                Measurement
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  {...register("measurement")}
                  className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
                />
                {errors.measurement && (
                  <span className="block text-xs text-destructive">
                    {errors.measurement.message}
                  </span>
                )}
              </label>
            )}
            <label className="space-y-1.5 text-sm font-medium">
              Advance (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("advanceAmount")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              />
              {errors.advanceAmount && (
                <span className="block text-xs text-destructive">
                  {errors.advanceAmount.message}
                </span>
              )}
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Start date
              <DatePicker
                value={startDate}
                onChange={(value) =>
                  setValue("startDate", value, { shouldValidate: true })
                }
                ariaLabelledBy="contract-form-title"
              />
              {errors.startDate && (
                <span className="block text-xs text-destructive">
                  {errors.startDate.message}
                </span>
              )}
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Status
              <select
                {...register("status")}
                className="h-11 w-full rounded-xl border bg-background px-3 font-normal"
              >
                {Object.values(CONTRACT_STATUS).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">
              Estimated contract value preview
            </p>
            <p className="mt-1 font-semibold">
              {formatContractCurrency(
                rateUnit === "LUMP_SUM" ? rate : rate * measurement,
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The saved value is calculated and returned by the server.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                [
                  "scopeIncluded",
                  "Included scope",
                  included,
                  setIncluded,
                  scopesIncluded,
                ],
                [
                  "scopeExcluded",
                  "Excluded scope",
                  excluded,
                  setExcluded,
                  scopesExcluded,
                ],
              ] as const
            ).map(([field, title, text, setText, values]) => (
              <fieldset key={field} className="min-w-0 space-y-2">
                <legend className="text-sm font-medium">{title}</legend>
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addScope(field, text, values, () => setText(""));
                      }
                    }}
                    className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm"
                    placeholder="Add scope item"
                  />
                  <button
                    type="button"
                    aria-label={`Add ${title.toLowerCase()}`}
                    onClick={() =>
                      addScope(field, text, values, () => setText(""))
                    }
                    className="rounded-lg border px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <ul className="space-y-1">
                  {values.map((value, index) => (
                    <li
                      key={`${value}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span className="break-words">{value}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${value}`}
                        onClick={() =>
                          setValue(
                            field,
                            values.filter((_, i) => i !== index),
                            { shouldDirty: true },
                          )
                        }
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ))}
          </div>
          <label className="block space-y-1.5 text-sm font-medium">
            Notes
            <textarea
              rows={3}
              maxLength={5000}
              {...register("notes")}
              className="w-full resize-y rounded-xl border bg-background p-3 font-normal"
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onCancel}
              className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || vendors.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {submitting
                ? "Saving…"
                : contract
                  ? "Save changes"
                  : "Create contract"}
            </button>
          </div>
        </form>;
}


