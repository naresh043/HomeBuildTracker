import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileText,
  Smartphone,
} from "lucide-react";

import type { Payment } from "@/features/payments/payment.types";

import {
  formatPaymentAmount,
  formatPaymentDate,
  getPaymentMethodLabel,
  getPaymentTypeLabel,
  getVerificationStatusLabel,
} from "@/features/payments/payment.utils";

interface PaymentCardProps {
  payment: Payment;
  onClick?: (payment: Payment) => void;
}

const getMethodIcon = (method: Payment["method"]) => {
  switch (method) {
    case "CASH":
      return Banknote;

    case "UPI":
      return Smartphone;

    case "BANK_TRANSFER":
      return CreditCard;

    case "CHEQUE":
      return FileText;
  }
};

export function PaymentCard({ payment, onClick }: PaymentCardProps) {
  const MethodIcon = getMethodIcon(payment.method);

  const isVerified = payment.verificationStatus === "VERIFIED";

  return (
    <button
      type="button"
      onClick={() => onClick?.(payment)}
      className="w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/50 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              {payment.paymentNo}
            </h3>

            {isVerified ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {getPaymentTypeLabel(payment.paymentType)}
          </p>
        </div>

        <p className="shrink-0 text-sm font-bold">
          {formatPaymentAmount(payment.amount)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="truncate text-muted-foreground">
            {formatPaymentDate(payment.date)}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <MethodIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="truncate text-muted-foreground">
            {getPaymentMethodLabel(payment.method)}
          </span>
        </div>
      </div>

      {payment.method === "UPI" && payment.transactionReference && (
        <div className="mt-3 border-t pt-3">
          <p className="truncate text-xs text-muted-foreground">
            Ref: {payment.transactionReference}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {getVerificationStatusLabel(payment.verificationStatus)}
        </span>

        {payment.notes && (
          <span className="max-w-[60%] truncate text-xs text-muted-foreground">
            {payment.notes}
          </span>
        )}
      </div>
    </button>
  );
}
