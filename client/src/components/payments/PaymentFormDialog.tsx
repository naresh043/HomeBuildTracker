import { X } from "lucide-react";
import type { Payment } from "@/features/payments/payment.types";
import type { PaymentFormValues } from "@/features/payments/payment.schema";
import PaymentForm from "./PaymentForm";

interface Props {
  open: boolean;
  payment: Payment | null;
  vendors: Array<{ id: string; name: string; status?: string; isDeleted?: boolean }>;
  stages: Array<{ id: string; name: string; isDeleted?: boolean }>;
  currentUserId: string;
  optionsLoading: boolean;
  optionsError?: string;
  isSubmitting: boolean;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
  onClose: () => void;
}

export default function PaymentFormDialog({ open, payment, vendors, stages, currentUserId, optionsLoading, optionsError, isSubmitting, onSubmit, onClose }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="payment-form-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-xl sm:rounded-2xl"><header className="mb-5 flex items-start justify-between gap-4"><div><h2 id="payment-form-title" className="text-lg font-semibold">{payment ? `Edit ${payment.paymentNo}` : "Record payment"}</h2><p className="mt-1 text-sm text-muted-foreground">Record money paid for house construction.</p></div><button type="button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button></header><PaymentForm payment={payment} vendors={vendors} stages={stages} currentUserId={currentUserId} optionsLoading={optionsLoading} optionsError={optionsError} isSubmitting={isSubmitting} onSubmit={onSubmit} onCancel={onClose} /></section></div>;
}
