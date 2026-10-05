import {
  Banknote,
  Check,
  CreditCard,
  Eye,
  FileText,
  Pencil,
  RotateCcw,
  Smartphone,
  Trash2,
} from "lucide-react";

import type { Payment } from "@/features/payments/payment.types";

import {
  formatPaymentAmount,
  formatPaymentDate,
  getPaymentMethodLabel,
  getPaymentTypeLabel,
  getUpiAppLabel,
  getVerificationStatusLabel,
} from "@/features/payments/payment.utils";

interface PaymentCardProps {
  payment: Payment;
  vendorName: string;
  stageName: string;
  isVerifying?: boolean;
  isRestoring?: boolean;
  onDetails: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onVerify: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
}

function MethodIcon({ method }: { method: Payment["method"] }) {
  const className = "h-4 w-4 shrink-0 text-muted-foreground";

  switch (method) {
    case "CASH":
      return <Banknote className={className} aria-hidden="true" />;

    case "UPI":
      return <Smartphone className={className} aria-hidden="true" />;

    case "BANK":
      return <CreditCard className={className} aria-hidden="true" />;

    case "CHEQUE":
    case "OTHER":
      return <FileText className={className} aria-hidden="true" />;

    default:
      return null;
  }
}

export default function PaymentCard({
  payment,
  vendorName,
  stageName,
  isVerifying = false,
  isRestoring = false,
  onDetails,
  onEdit,
  onVerify,
  onDelete,
  onRestore,
}: PaymentCardProps) {
  const verified = payment.verificationStatus === "VERIFIED";

  const isDeleted = payment.isDeleted;

  const hasTransaction =
    payment.method === "UPI" && Boolean(payment.transactionReference);

  const hasNotes = Boolean(payment.notes?.trim());

  return (
    <article
      className={[
        "flex h-full min-w-0 flex-col",
        "rounded-2xl border border-border",
        "p-4 shadow-sm",
        isDeleted ? "border-destructive/30 bg-muted/40" : "bg-card",
      ].join(" ")}
    >
      {/* =========================================================
          CARD CONTENT
          ========================================================= */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* -------------------------------------------------------
            HEADER
            ------------------------------------------------------- */}
        <div className="flex min-w-0 items-start justify-between gap-3">
          {/* Left side */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {payment.paymentNo} · {formatPaymentDate(payment.date)}
            </p>

            <p className="mt-1 truncate text-base font-semibold text-foreground">
              {getPaymentTypeLabel(payment.paymentType)}
            </p>

            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground">
              <MethodIcon method={payment.method} />

              <span className="truncate">
                {getPaymentMethodLabel(payment.method)}
                {payment.method === "UPI" && payment.upiApp
                  ? ` · ${getUpiAppLabel(payment.upiApp)}`
                  : ""}
              </span>
            </p>
          </div>

          {/* Right side */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <p className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground">
              {formatPaymentAmount(payment.amount)}
            </p>

            <span
              className={[
                "rounded-full px-2.5 py-1",
                "text-xs font-medium",
                verified
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-amber-500/10 text-amber-700",
              ].join(" ")}
            >
              {getVerificationStatusLabel(payment.verificationStatus)}
            </span>

            {isDeleted && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                Deleted
              </span>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------
            PAYMENT DETAILS
            ------------------------------------------------------- */}
        <div
          className={[
            "mt-4 grid min-w-0 grid-cols-1",
            "gap-x-4 gap-y-2",
            "border-t border-border pt-3",
            "text-xs sm:grid-cols-2",
          ].join(" ")}
        >
          {/* Vendor */}
          <p className="min-w-0 truncate text-muted-foreground">
            <span className="font-medium text-foreground">Vendor</span> ·{" "}
            {vendorName}
          </p>

          {/* Stage */}
          <p className="min-w-0 truncate text-muted-foreground">
            <span className="font-medium text-foreground">Stage</span> ·{" "}
            {stageName}
          </p>

          {/* Transaction */}
          {hasTransaction && (
            <p className="min-w-0 truncate text-muted-foreground sm:col-span-2">
              <span className="font-medium text-foreground">Transaction</span> ·{" "}
              {payment.transactionReference}
            </p>
          )}
        </div>

        {/* -------------------------------------------------------
            NOTES SLOT

            Important:
            Always reserve the same layer for notes.

            This prevents cards with notes and cards without notes
            from pushing the action footer into different positions.
            ------------------------------------------------------- */}
        <div
          className={[
            "mt-3 min-h-[44px]",
            "border-t border-border pt-3",
            "text-xs text-muted-foreground",
            !hasNotes ? "border-transparent" : "",
          ].join(" ")}
        >
          {hasNotes && <p className="line-clamp-2">{payment.notes}</p>}
        </div>
      </div>

      {/* =========================================================
          ACTION FOOTER

          This is intentionally outside the content section.

          `mt-auto` guarantees that this footer stays at the
          bottom of every card when cards have equal height.
          ========================================================= */}
      <div
        className={[
          "mt-auto",
          "flex min-h-12 items-center",
          "justify-between gap-2",
          "border-t border-border pt-2",
        ].join(" ")}
      >
        {/* -------------------------------------------------------
            LEFT ACTION
            ------------------------------------------------------- */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <button
            type="button"
            aria-label={`View ${payment.paymentNo}`}
            title="View details"
            onClick={() => onDetails(payment)}
            className={[
              "flex h-10 w-10 items-center justify-center",
              "rounded-lg",
              "text-muted-foreground",
              "transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-ring",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* -------------------------------------------------------
            RIGHT ACTIONS

            Fixed minimum width keeps the action layer stable.
            ------------------------------------------------------- */}
        <div
          className={[
            "flex h-10 shrink-0 items-center",
            "justify-end gap-1",
          ].join(" ")}
        >
          {isDeleted ? (
            <button
              type="button"
              aria-label={`Restore ${payment.paymentNo}`}
              title="Restore payment"
              disabled={isRestoring}
              onClick={() => onRestore(payment)}
              className={[
                "inline-flex h-10 items-center gap-1.5",
                "rounded-lg px-3",
                "text-sm font-medium text-primary",
                "transition-colors",
                "hover:bg-primary/10",
                "disabled:pointer-events-none",
                "disabled:opacity-50",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-ring",
                "focus-visible:ring-offset-2",
              ].join(" ")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />

              <span>{isRestoring ? "Restoring…" : "Restore"}</span>
            </button>
          ) : (
            <>
              {/* Edit */}
              <button
                type="button"
                aria-label={`Edit ${payment.paymentNo}`}
                title="Edit"
                onClick={() => onEdit(payment)}
                className={[
                  "flex h-10 w-10 items-center justify-center",
                  "rounded-lg",
                  "text-muted-foreground",
                  "transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-ring",
                  "focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Verify */}
              {!verified && (
                <button
                  type="button"
                  aria-label={`Verify ${payment.paymentNo}`}
                  title="Verify payment"
                  disabled={isVerifying}
                  onClick={() => onVerify(payment)}
                  className={[
                    "flex h-10 w-10 items-center justify-center",
                    "rounded-lg",
                    "text-emerald-700",
                    "transition-colors",
                    "hover:bg-emerald-500/10",
                    "disabled:pointer-events-none",
                    "disabled:opacity-50",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-emerald-500",
                    "focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                aria-label={`Delete ${payment.paymentNo}`}
                title="Delete"
                onClick={() => onDelete(payment)}
                className={[
                  "flex h-10 w-10 items-center justify-center",
                  "rounded-lg",
                  "text-destructive",
                  "transition-colors",
                  "hover:bg-destructive/10",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-destructive",
                  "focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
