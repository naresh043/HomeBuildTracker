import type { MaterialUnit } from "./material.types";

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  BAG: "Bag",
  KG: "Kg",
  TON: "Ton",
  LOAD: "Load",
  TRACTOR_LOAD: "Tractor Load",
  PIECE: "Piece",
  BOX: "Box",
  METER: "Meter",
  SQFT: "Sq Ft",
  LITER: "Liter",
  OTHER: "Other",
};

export const getMaterialUnitLabel = (unit: MaterialUnit): string =>
  MATERIAL_UNIT_LABELS[unit];

export const formatMaterialName = (name: string): string => name.trim();

export const formatMaterialCategory = (category: string): string =>
  category.trim();

export const formatMaterialUnit = (
  quantity: number,
  unit: MaterialUnit,
): string => `${quantity} ${getMaterialUnitLabel(unit)}`;

/**
 * Standard categories available in the material form.
 *
 * The backend still stores category as a string, so this list
 * represents the application's standard category options only.
 */
export const STANDARD_MATERIAL_CATEGORIES = [
  "Building Materials",
  "Construction Material",
  "Steel",
  "Roofing",
  "Electrical",
  "Plumbing",
  "Wood",
  "Paint",
] as const;

/**
 * Normalizes a material category for comparison.
 *
 * This prevents categories such as:
 * "Steel"
 * " steel "
 * "STEEL"
 *
 * from being treated as different categories by the UI.
 */
export const normalizeMaterialCategory = (category: string): string =>
  category.trim().toLowerCase();

/**
 * Returns the complete category list used by the UI.
 *
 * It combines:
 * 1. Standard application categories
 * 2. Categories already stored in the database
 *
 * Duplicate categories are removed case-insensitively.
 */
export const getMaterialCategories = (
  existingCategories: string[],
): string[] => {
  const categories = [...STANDARD_MATERIAL_CATEGORIES, ...existingCategories];

  const uniqueCategories = new Map<string, string>();

  for (const category of categories) {
    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      continue;
    }

    const normalizedCategory = normalizeMaterialCategory(trimmedCategory);

    if (!uniqueCategories.has(normalizedCategory)) {
      uniqueCategories.set(normalizedCategory, trimmedCategory);
    }
  }

  return Array.from(uniqueCategories.values()).sort((a, b) =>
    a.localeCompare(b),
  );
};
