import MaterialCard from "./MaterialCard";

import type { Material } from "@/features/materials/material.types";

interface MaterialListProps {
  materials: Material[];
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onRestore?: (material: Material) => void;
}

export default function MaterialList({
  materials,
  onEdit,
  onDelete,
  onRestore,
}: MaterialListProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {materials.map((material) => (
        <MaterialCard
          key={material._id}
          material={material}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}