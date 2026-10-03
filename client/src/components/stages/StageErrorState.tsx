import { AlertCircle, RefreshCw } from "lucide-react";

interface StageErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function StageErrorState({
  message = "We couldn't load the construction stages. Please try again.",
  onRetry,
  isRetrying = false,
}: StageErrorStateProps) {
  return (
    <section
      aria-label="Construction stages error"
      role="alert"
      className="flex w-full flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-card px-5 py-10 text-center shadow-sm sm:px-8"
    >
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10"
      >
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>

      <h2 className="mt-4 text-base font-semibold text-foreground">
        Unable to load stages
      </h2>

      <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
          />

          <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
        </button>
      )}
    </section>
  );
}