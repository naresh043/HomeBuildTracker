import { zodResolver } from "@hookform/resolvers/zod";

import { X } from "lucide-react";

import { useEffect } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";

import { DatePicker } from "@/components/ui/date-picker";

import type { ConstructionStage } from "@/features/stages/stage.types";

import {
  CONSTRUCTION_STAGE_STATUS_LABELS,
  formatConstructionStageDate,
} from "@/features/stages/stage.utils";

import {
  createStageSchema,
  updateStageSchema,
  type CreateStageFormValues,
  type UpdateStageFormValues,
} from "@/features/stages/stage.schema";

interface StageFormProps {
  stage?: ConstructionStage | null;
  isSubmitting?: boolean;
  onSubmit: (
    values: CreateStageFormValues | UpdateStageFormValues,
  ) => Promise<void> | void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  {
    value: "NOT_STARTED",
    label: CONSTRUCTION_STAGE_STATUS_LABELS.NOT_STARTED,
  },
  {
    value: "IN_PROGRESS",
    label: CONSTRUCTION_STAGE_STATUS_LABELS.IN_PROGRESS,
  },
  {
    value: "COMPLETED",
    label: CONSTRUCTION_STAGE_STATUS_LABELS.COMPLETED,
  },
  {
    value: "ON_HOLD",
    label: CONSTRUCTION_STAGE_STATUS_LABELS.ON_HOLD,
  },
] as const;

const inputClassName =
  "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60";

const labelClassName = "mb-1.5 block text-sm font-medium text-foreground";

const errorClassName = "mt-1 text-xs text-destructive";

export default function StageForm({
  stage,
  isSubmitting = false,
  onSubmit,
  onClose,
}: StageFormProps) {
  const isEditMode = Boolean(stage);

  /*
   * ============================================================
   * CREATE FORM
   * ============================================================
   */

  const createForm = useForm<CreateStageFormValues>({
    resolver: zodResolver(createStageSchema),

    defaultValues: {
      name: "",
      description: "",
      status: "NOT_STARTED",
      order: 1,
      startDate: "",
      completionDate: "",
      notes: "",
    },
  });

  /*
   * ============================================================
   * UPDATE FORM
   * ============================================================
   */

  const updateForm = useForm<UpdateStageFormValues>({
    resolver: zodResolver(updateStageSchema),

    defaultValues: {
      name: stage?.name ?? "",
      status: stage?.status ?? "NOT_STARTED",
      completionDate: stage?.completionDate ?? "",
      notes: stage?.notes ?? "",
    },
  });

  /*
   * ============================================================
   * RESET FORM WHEN STAGE CHANGES
   * ============================================================
   */

  useEffect(() => {
    if (!stage) {
      createForm.reset({
        name: "",
        description: "",
        status: "NOT_STARTED",
        order: 1,
        startDate: "",
        completionDate: "",
        notes: "",
      });

      return;
    }

    updateForm.reset({
      name: stage.name,
      status: stage.status,
      completionDate: stage.completionDate ?? "",
      notes: stage.notes ?? "",
    });
  }, [stage, createForm, updateForm]);

  /*
   * ============================================================
   * WATCH STATUS
   * ============================================================
   */

  const createStatus = useWatch({ control: createForm.control, name: "status" });
  const updateStatus = useWatch({ control: updateForm.control, name: "status" });

  const isCreateCompleted = createStatus === "COMPLETED";
  const isUpdateCompleted = updateStatus === "COMPLETED";

  /*
   * ============================================================
   * CREATE SUBMIT
   * ============================================================
   */

  const handleCreateSubmit = async (values: CreateStageFormValues) => {
    await onSubmit(values);
  };

  /*
   * ============================================================
   * UPDATE SUBMIT
   * ============================================================
   */

  const handleUpdateSubmit = async (values: UpdateStageFormValues) => {
    await onSubmit(values);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-form-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
          <div>
            <h2
              id="stage-form-title"
              className="text-lg font-semibold text-foreground"
            >
              {isEditMode ? "Edit stage" : "Create stage"}
            </h2>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {isEditMode
                ? "Update the construction stage details."
                : "Add a new construction stage."}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================
            FORM CONTENT
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {!isEditMode ? (
            /*
             * ==================================================
             * CREATE FORM
             * ==================================================
             */

            <form
              id="create-stage-form"
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              {/* =================================================
                  STAGE NAME
              ================================================= */}

              <div>
                <label htmlFor="stage-name" className={labelClassName}>
                  Stage name
                </label>

                <input
                  id="stage-name"
                  type="text"
                  placeholder="e.g. Electrical"
                  disabled={isSubmitting}
                  className={inputClassName}
                  {...createForm.register("name")}
                />

                {createForm.formState.errors.name?.message && (
                  <p className={errorClassName}>
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>
                <label htmlFor="stage-description" className={labelClassName}>
                  Description
                </label>

                <textarea
                  id="stage-description"
                  rows={3}
                  placeholder="Describe the work included in this stage"
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
                  {...createForm.register("description")}
                />

                {createForm.formState.errors.description?.message && (
                  <p className={errorClassName}>
                    {createForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* =================================================
                  STATUS + ORDER
              ================================================= */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* STATUS */}

                <div>
                  <label htmlFor="stage-status" className={labelClassName}>
                    Status
                  </label>

                  <select
                    id="stage-status"
                    disabled={isSubmitting}
                    className={inputClassName}
                    {...createForm.register("status")}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {createForm.formState.errors.status?.message && (
                    <p className={errorClassName}>
                      {createForm.formState.errors.status.message}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground sm:col-span-2">New stages are added after the active stages. You can change their order from the reorder control.</p>
              </div>

              {/* =================================================
                  START DATE — DATE PICKER
              ================================================= */}

              <div>
                <label htmlFor="stage-start-date" className={labelClassName}>
                  Start date
                </label>

                <Controller
                  name="startDate"
                  control={createForm.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select start date"
                    />
                  )}
                />

                {createForm.formState.errors.startDate?.message && (
                  <p className={errorClassName}>
                    {createForm.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              {/* =================================================
                  COMPLETION DATE — ONLY WHEN COMPLETED
              ================================================= */}

              {isCreateCompleted && (
                <div>
                  <label
                    htmlFor="stage-completion-date"
                    className={labelClassName}
                  >
                    Completion date
                  </label>

                  <Controller
                    name="completionDate"
                    control={createForm.control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select completion date"
                      />
                    )}
                  />

                  {createForm.formState.errors.completionDate?.message && (
                    <p className={errorClassName}>
                      {createForm.formState.errors.completionDate.message}
                    </p>
                  )}
                </div>
              )}

              {/* =================================================
                  NOTES
              ================================================= */}

              <div>
                <label htmlFor="stage-notes" className={labelClassName}>
                  Notes
                </label>

                <textarea
                  id="stage-notes"
                  rows={3}
                  placeholder="Optional notes"
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
                  {...createForm.register("notes")}
                />

                {createForm.formState.errors.notes?.message && (
                  <p className={errorClassName}>
                    {createForm.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </form>
          ) : (
            /*
             * ==================================================
             * UPDATE FORM
             * ==================================================
             */

            <form
              id="update-stage-form"
              onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}
              className="space-y-4"
            >
              {/* =================================================
                  STAGE NAME
              ================================================= */}

              <div>
                <label htmlFor="edit-stage-name" className={labelClassName}>
                  Stage name
                </label>

                <input
                  id="edit-stage-name"
                  type="text"
                  disabled={isSubmitting}
                  className={inputClassName}
                  {...updateForm.register("name")}
                />

                {updateForm.formState.errors.name?.message && (
                  <p className={errorClassName}>
                    {updateForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* =================================================
                  STATUS + ORDER
              ================================================= */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* STATUS */}

                <div>
                  <label htmlFor="edit-stage-status" className={labelClassName}>
                    Status
                  </label>

                  <select
                    id="edit-stage-status"
                    disabled={isSubmitting}
                    className={inputClassName}
                    {...updateForm.register("status")}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {updateForm.formState.errors.status?.message && (
                    <p className={errorClassName}>
                      {updateForm.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {/* CURRENT ORDER */}

                <div>
                  <label className={labelClassName}>Current order</label>

                  <div className="flex min-h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                    {stage?.order ?? "—"}
                  </div>
                </div>
              </div>

              {/* =================================================
                  START DATE — DISPLAY ONLY
              ================================================= */}

              <div>
                <label className={labelClassName}>Start date</label>

                <div className="flex min-h-11 items-center rounded-xl border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                  {formatConstructionStageDate(stage?.startDate)}
                </div>
              </div>

              {/* =================================================
                  COMPLETION DATE — ONLY WHEN COMPLETED
              ================================================= */}

              {isUpdateCompleted && (
                <div>
                  <label
                    htmlFor="edit-stage-completion-date"
                    className={labelClassName}
                  >
                    Completion date
                  </label>

                  <Controller
                    name="completionDate"
                    control={updateForm.control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select completion date"
                      />
                    )}
                  />

                  {updateForm.formState.errors.completionDate?.message && (
                    <p className={errorClassName}>
                      {updateForm.formState.errors.completionDate.message}
                    </p>
                  )}
                </div>
              )}

              {/* =================================================
                  NOTES
              ================================================= */}

              <div>
                <label htmlFor="edit-stage-notes" className={labelClassName}>
                  Notes
                </label>

                <textarea
                  id="edit-stage-notes"
                  rows={3}
                  placeholder="Optional notes"
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
                  {...updateForm.register("notes")}
                />

                {updateForm.formState.errors.notes?.message && (
                  <p className={errorClassName}>
                    {updateForm.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ======================================================
            FOOTER ACTIONS
        ====================================================== */}

        <div className="flex shrink-0 gap-3 border-t bg-background px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-11 flex-1 rounded-xl border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form={isEditMode ? "update-stage-form" : "create-stage-form"}
            disabled={isSubmitting}
            className="min-h-11 flex-1 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-opacity active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save changes"
                : "Create stage"}
          </button>
        </div>
      </div>
    </div>
  );
}
