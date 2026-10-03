import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  createMaterialSchema,
  type CreateMaterialFormValues,
} from "@/features/materials/material.schema";
import {
  MATERIAL_UNIT,
  type Material,
} from "@/features/materials/material.types";
import { getMaterialUnitLabel } from "@/features/materials/material.utils";

interface MaterialFormProps {
  material?: Material | null;
  categories?: string[];
  isSubmitting?: boolean;
  onSubmit: (values: CreateMaterialFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

export default function MaterialForm({
  material = null,
  categories = [],
  isSubmitting = false,
  onSubmit,
  onCancel,
}: MaterialFormProps) {
  const isEditMode = Boolean(material);

  const form = useForm<CreateMaterialFormValues>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: material?.name ?? "",
      category: material?.category ?? "",
      defaultUnit: material?.defaultUnit ?? MATERIAL_UNIT.BAG,
    },
  });

  useEffect(() => {
    form.reset({
      name: material?.name ?? "",
      category: material?.category ?? "",
      defaultUnit: material?.defaultUnit ?? MATERIAL_UNIT.BAG,
    });
  }, [form, material]);

  const handleSubmit = async (values: CreateMaterialFormValues) => {
    await onSubmit(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-5"
      noValidate
    >
      <div>
        <label
          htmlFor="material-name"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Material name
        </label>

        <input
          id="material-name"
          type="text"
          autoComplete="off"
          placeholder="e.g. Cement"
          disabled={isSubmitting}
          {...form.register("name")}
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {form.formState.errors.name?.message && (
          <p className="mt-1.5 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="material-category"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Category
        </label>

        <select
          id="material-category"
          disabled={isSubmitting}
          {...form.register("category")}
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {form.formState.errors.category?.message && (
          <p className="mt-1.5 text-sm text-destructive">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="material-default-unit"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Default unit
        </label>

        <select
          id="material-default-unit"
          disabled={isSubmitting}
          {...form.register("defaultUnit")}
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Object.values(MATERIAL_UNIT).map((unit) => (
            <option key={unit} value={unit}>
              {getMaterialUnitLabel(unit)}
            </option>
          ))}
        </select>

        {form.formState.errors.defaultUnit?.message && (
          <p className="mt-1.5 text-sm text-destructive">
            {form.formState.errors.defaultUnit.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}

          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Material"
              : "Add Material"}
        </button>
      </div>
    </form>
  );
}
