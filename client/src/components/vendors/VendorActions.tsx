import { Edit3, RotateCcw, Trash2 } from "lucide-react";

import type { Vendor } from "@/features/vendors/vendor.types";

interface VendorActionsProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onRestore: (vendor: Vendor) => void;
}

const VendorActions = ({
  vendor,
  onEdit,
  onDelete,
  onRestore,
}: VendorActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      {!vendor.isDeleted && (
        <>
          <button
            type="button"
            onClick={() => onEdit(vendor)}
            aria-label={`Edit ${vendor.name}`}
            title={`Edit ${vendor.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(vendor)}
            aria-label={`Delete ${vendor.name}`}
            title={`Delete ${vendor.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}

      {vendor.isDeleted && (
        <button
          type="button"
          onClick={() => onRestore(vendor)}
          aria-label={`Restore ${vendor.name}`}
          title={`Restore ${vendor.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default VendorActions;
