import { AlertCircle, RefreshCw } from "lucide-react";

interface VendorErrorStateProps {
  message?: string;
  onRetry: () => void;
}

const VendorErrorState = ({
  message = "Unable to load vendors. Please try again.",
  onRetry,
}: VendorErrorStateProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        Something went wrong
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-5 text-gray-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <RefreshCw
          className="h-4 w-4"
          aria-hidden="true"
        />
        Try Again
      </button>
    </div>
  );
};

export default VendorErrorState;