import type {
  Payment,
  PaymentMethod,
  PaymentType,
  VerificationStatus,
} from "./payment.types";

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  ADVANCE: "Advance",
  MATERIAL_PAYMENT: "Material Payment",
  CONTRACT_PAYMENT: "Contract Payment",
  SERVICE_PAYMENT: "Service Payment",
  OTHER: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK: "Bank",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: "Verified",
  NEEDS_VERIFICATION: "Needs Verification",
};

export const formatPaymentAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPaymentDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const getPaymentTypeLabel = (paymentType: PaymentType): string => {
  return PAYMENT_TYPE_LABELS[paymentType];
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  return PAYMENT_METHOD_LABELS[method];
};

export const getVerificationStatusLabel = (
  status: VerificationStatus,
): string => {
  return VERIFICATION_STATUS_LABELS[status];
};

export const getPaymentReference = (payment: Payment): string => {
  if (payment.method === "UPI" && payment.transactionReference) {
    return payment.transactionReference;
  }

  return payment.paymentNo;
};

export const getUpiAppLabel = (value: NonNullable<Payment["upiApp"]>): string => {
  const labels: Record<NonNullable<Payment["upiApp"]>, string> = {
    PHONEPE: "PhonePe",
    GOOGLE_PAY: "Google Pay",
    PAYTM: "Paytm",
    BHIM: "BHIM",
    OTHER: "Other",
  };
  return labels[value];
};
