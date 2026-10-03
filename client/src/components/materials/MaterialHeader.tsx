import { Plus } from "lucide-react";

interface MaterialHeaderProps {
  onAdd: () => void;
}

export default function MaterialHeader({
  onAdd,
}: MaterialHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Materials
        </h1>

        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Manage construction materials used for your house.
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
      >
        <Plus
          className="h-4 w-4"
          aria-hidden="true"
        />
        Add Material
      </button>
    </header>
  );
}