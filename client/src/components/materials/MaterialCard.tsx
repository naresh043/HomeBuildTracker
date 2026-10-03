import {
  BrickWall,
  Droplets,
  Edit2,
  House,
  Package,
  Paintbrush,
  RotateCcw,
  Settings2,
  Trash2,
  TreePine,
  HardHat,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Material } from "@/features/materials/material.types";
import { getMaterialUnitLabel } from "@/features/materials/material.utils";

interface MaterialCardProps {
  material: Material;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onRestore?: (material: Material) => void;
}

interface MaterialCategoryStyle {
  icon: LucideIcon;
  iconWrapperClassName: string;
  iconClassName: string;
  accentClassName: string;
}

const DEFAULT_CATEGORY_STYLE: MaterialCategoryStyle = {
  icon: Package,
  iconWrapperClassName: "bg-muted",
  iconClassName: "text-muted-foreground",
  accentClassName: "border-l-muted-foreground/40",
};

const MATERIAL_CATEGORY_STYLES: Record<string, MaterialCategoryStyle> = {
  "building materials": {
    icon: BrickWall,
    iconWrapperClassName: "bg-amber-500/10",
    iconClassName: "text-amber-700",
    accentClassName: "border-l-amber-500",
  },

  "construction material": {
    icon: HardHat,
    iconWrapperClassName: "bg-orange-500/10",
    iconClassName: "text-orange-600",
    accentClassName: "border-l-orange-500",
  },

  electrical: {
    icon: Zap,
    iconWrapperClassName: "bg-yellow-500/10",
    iconClassName: "text-yellow-600",
    accentClassName: "border-l-yellow-500",
  },

  paint: {
    icon: Paintbrush,
    iconWrapperClassName: "bg-pink-500/10",
    iconClassName: "text-pink-600",
    accentClassName: "border-l-pink-500",
  },

  plumbing: {
    icon: Droplets,
    iconWrapperClassName: "bg-blue-500/10",
    iconClassName: "text-blue-600",
    accentClassName: "border-l-blue-500",
  },

  roofing: {
    icon: House,
    iconWrapperClassName: "bg-emerald-500/10",
    iconClassName: "text-emerald-600",
    accentClassName: "border-l-emerald-500",
  },

  steel: {
    icon: Settings2,
    iconWrapperClassName: "bg-slate-500/10",
    iconClassName: "text-slate-600",
    accentClassName: "border-l-slate-500",
  },

  wood: {
    icon: TreePine,
    iconWrapperClassName: "bg-green-500/10",
    iconClassName: "text-green-700",
    accentClassName: "border-l-green-600",
  },
};

const getCategoryStyle = (category: string): MaterialCategoryStyle => {
  const normalizedCategory = category.trim().toLowerCase();

  return MATERIAL_CATEGORY_STYLES[normalizedCategory] ?? DEFAULT_CATEGORY_STYLE;
};

export default function MaterialCard({
  material,
  onEdit,
  onDelete,
  onRestore,
}: MaterialCardProps) {
  const isDeleted = material.isDeleted;

  const categoryStyle = getCategoryStyle(material.category);
  const CategoryIcon = categoryStyle.icon;

  return (
    <article
      className={[
        "flex h-full flex-col rounded-xl border border-border border-l-4 bg-card p-4",
        categoryStyle.accentClassName,
        isDeleted ? "opacity-75" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              categoryStyle.iconWrapperClassName,
            ].join(" ")}
          >
            <CategoryIcon
              className={["h-5 w-5", categoryStyle.iconClassName].join(" ")}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {material.name}
            </h3>

            <p className="mt-1 truncate text-sm text-muted-foreground">
              {material.category}
            </p>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            isDeleted
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isDeleted ? "Deleted" : "Active"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
        <span className="text-sm text-muted-foreground">Default unit</span>

        <span className="text-sm font-medium text-foreground">
          {getMaterialUnitLabel(material.defaultUnit)}
        </span>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        {isDeleted ? (
          <button
            type="button"
            onClick={() => onRestore?.(material)}
            disabled={!onRestore}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restore
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(material)}
              disabled={!onEdit}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(material)}
              disabled={!onDelete}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
