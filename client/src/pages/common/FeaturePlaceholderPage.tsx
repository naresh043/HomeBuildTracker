import type { LucideIcon } from "lucide-react";

interface FeaturePlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeaturePlaceholderPage({
  title,
  description,
  icon: Icon,
}: FeaturePlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <section className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>

        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 rounded-xl border border-dashed p-4">
          <p className="text-sm font-medium">Module ready for implementation</p>

          <p className="mt-1 text-xs text-muted-foreground">
            The API integration and mobile-first interface will be implemented
            in the next feature phase.
          </p>
        </div>
      </section>
    </div>
  );
}
