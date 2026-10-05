import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { AlertCircle, CalendarDays, Home, Loader2, Pencil, RefreshCw, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { DatePicker } from "@/components/ui/date-picker";
import { useInitializeHouseMutation, useUpdateCurrentConstructionStageMutation, useUpdateHouseMutation } from "@/features/house/house.mutations";
import { useHouseQuery } from "@/features/house/house.queries";
import { houseInitializeSchema, houseUpdateSchema, type HouseInitializeFormValues, type HouseUpdateFormValues } from "@/features/house/house.schema";
import { HOUSE_STATUS_LABELS, formatHouseBudgetRange, formatHouseDate, formatHouseStatus, getHouseStatusDescription } from "@/features/house/house.utils";
import type { House } from "@/features/house/house.types";
import { useStagesQuery } from "@/features/stages/stage.queries";

const inputClass = "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const statusOptions = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;

export default function HousePage() {
  const houseQuery = useHouseQuery();
  const initializeMutation = useInitializeHouseMutation();
  const updateMutation = useUpdateHouseMutation();
  const stageMutation = useUpdateCurrentConstructionStageMutation();
  const [editOpen, setEditOpen] = useState(false);

  if (houseQuery.isLoading) return <HouseLoadingState />;
  if (houseQuery.isError && !isHouseMissing(houseQuery.error)) {
    return <HouseErrorState message={getErrorMessage(houseQuery.error, "Failed to load house configuration.")} onRetry={() => void houseQuery.refetch()} />;
  }

  const house = houseQuery.data?.data;
  if (houseQuery.isError || !house) {
    return <HouseEmptyState isInitializing={initializeMutation.isPending} onInitialize={() => initializeMutation.mutate({}, {
      onSuccess: (response) => { toast.success(response.message || "House initialized successfully."); },
      onError: (error) => toast.error(getErrorMessage(error, "Failed to initialize house.")),
    })} />;
  }

  const handleUpdate = (values: HouseUpdateFormValues) => {
    const payload: HouseUpdateFormValues = {};
    const nextMin = values.budgetMin ?? house.budgetMin / 100;
    const nextMax = values.budgetMax ?? house.budgetMax / 100;
    if (nextMin > nextMax) {
      toast.error("Minimum budget cannot exceed maximum budget.");
      return;
    }
    if (values.name !== house.name) payload.name = values.name;
    if (values.status !== house.status) payload.status = values.status;
    if (values.startDate !== house.startDate.slice(0, 10)) payload.startDate = values.startDate;
    if (values.budgetMin !== undefined && values.budgetMin !== house.budgetMin / 100) payload.budgetMin = Math.round(values.budgetMin * 100);
    if (values.budgetMax !== undefined && values.budgetMax !== house.budgetMax / 100) payload.budgetMax = Math.round(values.budgetMax * 100);
    if (!Object.keys(payload).length) { setEditOpen(false); return; }
    updateMutation.mutate(payload, {
      onSuccess: (response) => { toast.success(response.message || "House updated successfully."); setEditOpen(false); },
      onError: (error) => toast.error(getErrorMessage(error, "Failed to update house.")),
    });
  };

  return <HouseOverview house={house} editOpen={editOpen} isUpdating={updateMutation.isPending} onEdit={() => setEditOpen(true)} onCloseEdit={() => setEditOpen(false)} onUpdate={handleUpdate} onStageChange={(stageId) => stageMutation.mutate({ stageId }, {
    onSuccess: (response) => toast.success(response.message || "Current construction stage updated."),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update current stage.")),
  })} isUpdatingStage={stageMutation.isPending} />;
}

function HouseOverview({ house, editOpen, isUpdating, onEdit, onCloseEdit, onUpdate, onStageChange, isUpdatingStage }: {
  house: House; editOpen: boolean; isUpdating: boolean; onEdit: () => void; onCloseEdit: () => void;
  onUpdate: (values: HouseUpdateFormValues) => void; onStageChange: (stageId: string | null) => void; isUpdatingStage: boolean;
}) {
  const stagesQuery = useStagesQuery();
  const stages = useMemo(() => (stagesQuery.data?.data ?? []).filter((stage) => !stage.isDeleted), [stagesQuery.data]);
  const currentStageExists = Boolean(house.currentStageId && stages.some((stage) => stage._id === house.currentStageId));
  return <div className="mx-auto w-full max-w-5xl space-y-4 p-4 pb-24 sm:space-y-6 sm:p-6 lg:p-8">
    <section className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"><Home className="h-5 w-5" /></div><div className="min-w-0"><h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{house.name}</h1><p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">House configuration</p></div></div>
      <button type="button" onClick={onEdit} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Edit house configuration"><Pencil className="h-4 w-4" /><span className="hidden sm:inline">Edit house</span></button>
    </section>
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-foreground" aria-hidden="true" /><div className="min-w-0"><p className="text-sm font-semibold">{formatHouseStatus(house.status)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{getHouseStatusDescription(house.status)}</p></div></div></section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2"><HouseInfoCard icon={<CalendarDays className="h-5 w-5" />} label="Construction Started" value={formatHouseDate(house.startDate)} /><HouseInfoCard icon={<Wallet className="h-5 w-5" />} label="Budget Range" value={formatHouseBudgetRange(house.budgetMin, house.budgetMax)} /></section>
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><label htmlFor="current-stage" className={labelClass}>Current construction stage</label>
      {stagesQuery.isError ? <p role="alert" className="text-sm text-destructive">{getErrorMessage(stagesQuery.error, "Could not load construction stages.")}</p> : <select id="current-stage" value={currentStageExists ? house.currentStageId ?? "" : ""} disabled={stagesQuery.isLoading || isUpdatingStage || stages.length === 0} onChange={(event) => onStageChange(event.target.value || null)} className={inputClass}>
        <option value="">{stagesQuery.isLoading ? "Loading stages…" : stages.length ? "No current stage" : "No stages available"}</option>{stages.map((stage) => <option key={stage._id} value={stage._id}>{stage.name}</option>)}
      </select>}{isUpdatingStage && <p className="mt-2 text-xs text-muted-foreground" role="status">Updating current stage…</p>}{house.currentStageId && !currentStageExists && <p className="mt-2 text-xs text-muted-foreground">The saved stage is unavailable. Choose an available stage to replace it.</p>}
    </section>
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="border-b p-4 sm:p-5"><h2 className="text-base font-semibold">House Layout</h2><p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Floors and rooms configured for your house.</p></div>
      {house.floors.length ? <div className="divide-y">{house.floors.map((floor) => <FloorSection key={floor._id} floor={floor} />)}</div> : <p className="p-5 text-sm text-muted-foreground">No floors are configured.</p>}
    </section>
    {editOpen && <HouseEditDialog house={house} isSubmitting={isUpdating} onSubmit={onUpdate} onClose={onCloseEdit} />}
  </div>;
}

function HouseEditDialog({ house, isSubmitting, onSubmit, onClose }: { house: House; isSubmitting: boolean; onSubmit: (values: HouseUpdateFormValues) => void; onClose: () => void }) {
  const form = useForm<HouseUpdateFormValues>({ resolver: zodResolver(houseUpdateSchema), defaultValues: { name: house.name, status: house.status, startDate: house.startDate.slice(0, 10), budgetMin: house.budgetMin / 100, budgetMax: house.budgetMax / 100 } });
  const errors = form.formState.errors;
  const error = (message?: string) => message && <p className="mt-1 text-xs text-destructive" role="alert">{message}</p>;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="house-edit-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
    <h2 id="house-edit-title" className="text-lg font-semibold">Edit house configuration</h2><p className="mt-1 text-sm text-muted-foreground">Changes are saved to your single house configuration.</p>
    <form className="mt-5 space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <div><label htmlFor="house-name" className={labelClass}>House name</label><input id="house-name" className={inputClass} disabled={isSubmitting} {...form.register("name")} />{error(errors.name?.message)}</div>
      <div><label htmlFor="house-status" className={labelClass}>Status</label><select id="house-status" className={inputClass} disabled={isSubmitting} {...form.register("status")}>{statusOptions.map((status) => <option key={status} value={status}>{HOUSE_STATUS_LABELS[status]}</option>)}</select>{error(errors.status?.message)}</div>
      <div><span id="house-start-date-label" className={labelClass}>Construction start date</span><Controller name="startDate" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} ariaLabelledBy="house-start-date-label" />} />{error(errors.startDate?.message)}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label htmlFor="house-budget-min" className={labelClass}>Minimum budget (₹)</label><input id="house-budget-min" type="number" min="0" step="1" inputMode="numeric" className={inputClass} disabled={isSubmitting} {...form.register("budgetMin", { valueAsNumber: true })} />{error(errors.budgetMin?.message)}</div><div><label htmlFor="house-budget-max" className={labelClass}>Maximum budget (₹)</label><input id="house-budget-max" type="number" min="0" step="1" inputMode="numeric" className={inputClass} disabled={isSubmitting} {...form.register("budgetMax", { valueAsNumber: true })} />{error(errors.budgetMax?.message)}</div></div>
      <p className="text-xs text-muted-foreground">Budgets are entered in rupees and sent in the server’s integer paise units.</p>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-11 rounded-xl border px-4 text-sm">Cancel</button><button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? "Saving…" : "Save changes"}</button></div>
    </form>
  </section></div>;
}

function HouseInfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">{icon}</div><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold sm:text-base">{value}</p></div></div></div>;
}

function FloorSection({ floor }: { floor: House["floors"][number] }) {
  return <div className="p-4 sm:p-5"><div><h3 className="break-words text-sm font-semibold">{floor.name}</h3><p className="mt-1 text-xs text-muted-foreground">{floor.rooms.length} {floor.rooms.length === 1 ? "room" : "rooms"}</p></div><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{floor.rooms.map((room) => <div key={room._id} className="flex min-h-11 items-center rounded-lg border px-3 py-2.5"><span className="break-words text-sm">{room.name}</span></div>)}</div></div>;
}

function HouseLoadingState() { return <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8"><div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card"><div className="flex flex-col items-center gap-3"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Loading house...</p></div></div></div>; }
function HouseErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8"><div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5"><div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-destructive" /><div className="min-w-0"><p className="font-medium">Failed to load house</p><p className="mt-1 break-words text-sm text-muted-foreground">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted"><RefreshCw className="h-4 w-4" />Retry</button></div></div></div></div>; }
function HouseEmptyState({ isInitializing, onInitialize }: { isInitializing: boolean; onInitialize: () => void }) { const form = useForm<HouseInitializeFormValues>({ resolver: zodResolver(houseInitializeSchema), defaultValues: { confirm: true } }); return <div className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 lg:p-8"><form onSubmit={form.handleSubmit(onInitialize)} className="rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8"><Home className="mx-auto h-8 w-8 text-muted-foreground" /><h1 className="mt-4 text-lg font-semibold">Set up your house</h1><p className="mx-auto mt-2 max-w-md text-sm leading-5 text-muted-foreground">Initialize the default house configuration to start tracking construction. You can edit its name, dates, and budget after setup.</p>{form.formState.errors.confirm && <p role="alert" className="mt-3 text-sm text-destructive">{form.formState.errors.confirm.message}</p>}<button type="submit" disabled={isInitializing} className="mx-auto mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{isInitializing && <Loader2 className="h-4 w-4 animate-spin" />}{isInitializing ? "Initializing…" : "Initialize house"}</button></form></div>; }

function isHouseMissing(error: unknown): boolean { return isAxiosError(error) && error.response?.status === 404; }
function getErrorMessage(error: unknown, fallback: string): string { if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || error.message || fallback; return error instanceof Error ? error.message : fallback; }
