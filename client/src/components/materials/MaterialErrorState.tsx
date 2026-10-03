import { AlertCircle, RefreshCw } from "lucide-react";

interface MaterialErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function MaterialErrorState({
  message = "Unable to load materials. Please try again.",
  onRetry,
}: MaterialErrorStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle
          className="h-6 w-6 text-destructive"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 text-base font-semibold text-foreground">
        Something went wrong
      </h2>

      <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />
          Try again
        </button>
      )}
    </div>
  );
}