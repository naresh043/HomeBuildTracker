import { Plus, UsersRound } from "lucide-react";

interface VendorHeaderProps {
  vendorCount: number;
  onAddVendor: () => void;
}

const VendorHeader = ({
  vendorCount,
  onAddVendor,
}: VendorHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <UsersRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Vendors
          </h1>

          <p className="mt-0.5 text-sm text-gray-500">
            {vendorCount === 1
              ? "1 vendor"
              : `${vendorCount} vendors`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddVendor}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-auto"
      >
        <Plus
          className="h-4 w-4"
          aria-hidden="true"
        />
        Add Vendor
      </button>
    </header>
  );
};

export default VendorHeader;