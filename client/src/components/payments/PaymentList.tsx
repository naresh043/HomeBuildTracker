import PaymentCard from "./PaymentCard";
import type { Payment } from "@/features/payments/payment.types";

interface PaymentListProps {
  payments: Payment[];
  vendorNames: Map<string, string>;
  stageNames: Map<string, string>;
  verifyingId?: string;
  restoringId?: string;
  onDetails: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onVerify: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
}

export default function PaymentList(props: PaymentListProps) {
  if (!props.payments.length) return null;
  return <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{props.payments.map((payment) => <PaymentCard key={payment.id} payment={payment} vendorName={payment.paidToVendorId ? props.vendorNames.get(payment.paidToVendorId) ?? "Vendor unavailable" : "No vendor"} stageName={payment.stageId ? props.stageNames.get(payment.stageId) ?? "Stage unavailable" : "No stage"} isVerifying={props.verifyingId === payment.id} isRestoring={props.restoringId === payment.id} onDetails={props.onDetails} onEdit={props.onEdit} onVerify={props.onVerify} onDelete={props.onDelete} onRestore={props.onRestore} />)}</div>;
}
