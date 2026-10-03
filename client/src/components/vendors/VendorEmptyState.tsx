import { Plus, UsersRound } from "lucide-react";

interface VendorEmptyStateProps {
  showDeleted: boolean;
  onAddVendor: () => void;
}

const VendorEmptyState = ({
  showDeleted,
  onAddVendor,
}: VendorEmptyStateProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <UsersRound
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {showDeleted
          ? "No deleted vendors"
          : "No vendors yet"}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-5 text-gray-500">
        {showDeleted
          ? "There are no deleted vendors to display."
          : "Add your first vendor to start tracking suppliers, contractors, and service providers."}
      </p>

      {!showDeleted && (
        <button
          type="button"
          onClick={onAddVendor}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />
          Add Vendor
        </button>
      )}
    </div>
  );
};

export default VendorEmptyState;