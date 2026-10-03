import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createVendorSchema,
  type CreateVendorFormValues,
} from "@/features/vendors/vendor.schema";
import {
  VENDOR_TYPE,
  type Vendor,
} from "@/features/vendors/vendor.types";
import { getVendorTypeOptions } from "@/features/vendors/vendor.utils";

interface VendorFormProps {
  vendor?: Vendor | null;
  isSubmitting?: boolean;
  onSubmit: (
    values: CreateVendorFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
}

const VendorForm = ({
  vendor,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: VendorFormProps) => {
  const isEditMode = Boolean(vendor);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateVendorFormValues>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      name: "",
      type: VENDOR_TYPE.MATERIAL_SUPPLIER,
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        type: vendor.type,
        phone: vendor.phone ?? "",
        email: vendor.email ?? "",
        address: vendor.address ?? "",
        notes: vendor.notes ?? "",
      });

      return;
    }

    reset({
      name: "",
      type: VENDOR_TYPE.MATERIAL_SUPPLIER,
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  }, [vendor, reset]);

  const vendorTypeOptions = getVendorTypeOptions();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-5"
    >
      <div>
        <label
          htmlFor="vendor-name"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Vendor Name
        </label>

        <input
          id="vendor-name"
          type="text"
          placeholder="Enter vendor name"
          autoComplete="organization"
          {...register("name")}
          className={[
            "min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
            errors.name
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
          ].join(" ")}
        />

        {errors.name && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="vendor-type"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Vendor Type
        </label>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <select
              id="vendor-type"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className={[
                "min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
                "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
                errors.type
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200",
              ].join(" ")}
            >
              {vendorTypeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />

        {errors.type && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.type.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="vendor-phone"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Phone
        </label>

        <input
          id="vendor-phone"
          type="tel"
          placeholder="Enter phone number"
          autoComplete="tel"
          {...register("phone")}
          className={[
            "min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
            errors.phone
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
          ].join(" ")}
        />

        {errors.phone && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="vendor-email"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Email
        </label>

        <input
          id="vendor-email"
          type="email"
          placeholder="Enter email address"
          autoComplete="email"
          {...register("email")}
          className={[
            "min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
            errors.email
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
          ].join(" ")}
        />

        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="vendor-address"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Address
        </label>

        <textarea
          id="vendor-address"
          rows={3}
          placeholder="Enter vendor address"
          autoComplete="street-address"
          {...register("address")}
          className={[
            "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
            errors.address
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
          ].join(" ")}
        />

        {errors.address && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.address.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="vendor-notes"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Notes
        </label>

        <textarea
          id="vendor-notes"
          rows={4}
          placeholder="Add any additional notes"
          {...register("notes")}
          className={[
            "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
            errors.notes
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
          ].join(" ")}
        />

        {errors.notes && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create Vendor"}
        </button>
      </div>
    </form>
  );
};

export default VendorForm;