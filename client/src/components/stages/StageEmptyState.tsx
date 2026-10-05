import { ClipboardList, Plus } from "lucide-react";

interface StageEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export default function StageEmptyState({
  title = "No construction stages",
  description = "There are no construction stages to display yet.",
  actionLabel = "Add Stage",
  onAction,
  actionDisabled = false,
}: StageEmptyStateProps) {
  return (
    <section
      aria-label="Empty construction stages"
      className="flex w-full flex-col items-center justify-center rounded-2xl border bg-card px-5 py-10 text-center shadow-sm sm:px-8"
    >
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
      >
        <ClipboardList className="h-7 w-7 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>

      <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
        {description}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-wait disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </section>
  );
}
