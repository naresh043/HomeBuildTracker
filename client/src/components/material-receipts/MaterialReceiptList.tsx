import MaterialReceiptCard from "./MaterialReceiptCard";
import type { MaterialReceipt } from "@/features/material-receipts/material-receipt.types";

interface MaterialReceiptListProps {
  receipts: MaterialReceipt[];
  vendorNames: Map<string, string>;
  materialNames: Map<string, string>;
  stageNames: Map<string, string>;
  verifyingId?: string;
  restoringId?: string;
  onDetails: (receipt: MaterialReceipt) => void;
  onEdit: (receipt: MaterialReceipt) => void;
  onVerify: (receipt: MaterialReceipt) => void;
  onDelete: (receipt: MaterialReceipt) => void;
  onRestore: (receipt: MaterialReceipt) => void;
}

export default function MaterialReceiptList(props: MaterialReceiptListProps) {
  if (!props.receipts.length) return null;
  return <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{props.receipts.map(receipt => <MaterialReceiptCard key={receipt.id} receipt={receipt} vendorName={props.vendorNames.get(receipt.vendorId) ?? `Vendor record unavailable (${receipt.vendorId.slice(-6)})`} materialName={props.materialNames.get(receipt.materialId) ?? "Material unavailable"} stageName={props.stageNames.get(receipt.stageId) ?? "Stage unavailable"} isVerifying={props.verifyingId === receipt.id} isRestoring={props.restoringId === receipt.id} onDetails={props.onDetails} onEdit={props.onEdit} onVerify={props.onVerify} onDelete={props.onDelete} onRestore={props.onRestore} />)}</div>;
}
