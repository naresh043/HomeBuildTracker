import type { Vendor } from "@/features/vendors/vendor.types";

import VendorCard from "./VendorCard";

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onRestore: (vendor: Vendor) => void;
}

const VendorList = ({
  vendors,
  onEdit,
  onDelete,
  onRestore,
}: VendorListProps) => {
  if (vendors.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor._id}
          vendor={vendor}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
};

export default VendorList;
