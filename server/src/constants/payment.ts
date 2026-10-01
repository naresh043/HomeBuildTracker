export const PAYMENT_TYPE = {
  ADVANCE: "ADVANCE",
  CONTRACT_PAYMENT: "CONTRACT_PAYMENT",
  MATERIAL_PAYMENT: "MATERIAL_PAYMENT",
  SERVICE_PAYMENT: "SERVICE_PAYMENT",
  OTHER: "OTHER",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export const PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  BANK: "BANK",
  CHEQUE: "CHEQUE",
  OTHER: "OTHER",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const UPI_APP = {
  PHONEPE: "PHONEPE",
  GOOGLE_PAY: "GOOGLE_PAY",
  PAYTM: "PAYTM",
  BHIM: "BHIM",
  OTHER: "OTHER",
} as const;

export type UpiApp = (typeof UPI_APP)[keyof typeof UPI_APP];

export const PAYMENT_VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  NEEDS_VERIFICATION: "NEEDS_VERIFICATION",
} as const;

export type PaymentVerificationStatus =
  (typeof PAYMENT_VERIFICATION_STATUS)[keyof typeof PAYMENT_VERIFICATION_STATUS];
