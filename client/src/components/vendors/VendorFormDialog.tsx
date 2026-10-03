import { X } from "lucide-react";

import type { Vendor } from "@/features/vendors/vendor.types";
import type { CreateVendorFormValues } from "@/features/vendors/vendor.schema";

import VendorForm from "./VendorForm";

interface VendorFormDialogProps {
  open: boolean;
  vendor?: Vendor | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateVendorFormValues) => void | Promise<void>;
}

const VendorFormDialog = ({
  open,
  vendor = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: VendorFormDialogProps) => {
  if (!open) {
    return null;
  }

  const isEditMode = Boolean(vendor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-form-dialog-title"
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="vendor-form-dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              {isEditMode ? "Edit Vendor" : "Add Vendor"}
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              {isEditMode
                ? "Update vendor details"
                : "Add a vendor for your house construction"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close vendor form"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <VendorForm
            vendor={vendor}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorFormDialog;
