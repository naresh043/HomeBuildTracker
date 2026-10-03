import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VendorPaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

const VendorPagination = ({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: VendorPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3">
      <button
        type="button"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft
          className="h-4 w-4"
          aria-hidden="true"
        />
        <span className="hidden sm:inline">
          Previous
        </span>
      </button>

      <span className="text-sm font-medium text-gray-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">
          Next
        </span>

        <ChevronRight
          className="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default VendorPagination;