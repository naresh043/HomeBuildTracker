import SupplierAgreementCard from "./SupplierAgreementCard";
import type { SupplierAgreement } from "@/features/supplier-agreements/supplier-agreement.types";
import type { Vendor } from "@/features/vendors/vendor.types";
import type { Material } from "@/features/materials/material.types";

interface Props { agreements: SupplierAgreement[]; vendors: Vendor[]; materials: Material[]; restoringId?: string; onDetails: (agreement: SupplierAgreement) => void; onEdit: (agreement: SupplierAgreement) => void; onDelete: (agreement: SupplierAgreement) => void; onRestore: (agreement: SupplierAgreement) => void }
export default function SupplierAgreementList({ agreements, vendors, materials, restoringId, onDetails, onEdit, onDelete, onRestore }: Props) {
  return <section aria-label="Supplier Agreements" className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{agreements.map((agreement) => <SupplierAgreementCard key={agreement.id} agreement={agreement} vendorName={vendors.find((vendor) => vendor._id === agreement.vendorId)?.name ?? "Vendor no longer active"} materialNames={agreement.materialIds.map((id) => materials.find((material) => material._id === id)?.name).filter((name): name is string => Boolean(name))} isRestoring={restoringId === agreement.id} onDetails={onDetails} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />)}</section>;
}
