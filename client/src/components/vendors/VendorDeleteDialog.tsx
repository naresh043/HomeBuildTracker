import { Loader2, Trash2, X } from "lucide-react";

import type { Vendor } from "@/features/vendors/vendor.types";

interface VendorDeleteDialogProps {
  vendor: Vendor | null;
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VendorDeleteDialog = ({
  vendor,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: VendorDeleteDialogProps) => {
  if (!open || !vendor) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-delete-dialog-title"
        aria-describedby="vendor-delete-dialog-description"
        className="w-full rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="vendor-delete-dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                Delete vendor?
              </h2>

              <p className="mt-0.5 truncate text-sm text-gray-500">
                {vendor.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p
          id="vendor-delete-dialog-description"
          className="mt-5 text-sm leading-6 text-gray-600"
        >
          This vendor will be removed from the active vendor list. You can
          restore the vendor later if needed.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete Vendor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDeleteDialog;
