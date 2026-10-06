export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },

  health: "/health",

  house: {
    base: "/house",
    initialize: "/house/initialize",
    currentStage: "/house/current-stage",
  },

  stages: {
    base: "/stages",
    initialize: "/stages/initialize",
    reorder: "/stages/reorder",

    byId: (stageId: string) => `/stages/${stageId}`,
    restore: (stageId: string) => `/stages/${stageId}/restore`,
  },

  vendors: {
    base: "/vendors",
    active: "/vendors/active",

    byId: (vendorId: string) => `/vendors/${vendorId}`,
    restore: (vendorId: string) => `/vendors/${vendorId}/restore`,
  },

  materials: {
    base: "/materials",

    byId: (materialId: string) => `/materials/${materialId}`,
    restore: (materialId: string) => `/materials/${materialId}/restore`,
  },

  materialReceipts: {
    base: "/material-receipts",

    byId: (receiptId: string) => `/material-receipts/${receiptId}`,
    verify: (receiptId: string) => `/material-receipts/${receiptId}/verify`,
    restore: (receiptId: string) => `/material-receipts/${receiptId}/restore`,
  },

  payments: {
    base: "/payments",

    byId: (paymentId: string) => `/payments/${paymentId}`,
    verify: (paymentId: string) => `/payments/${paymentId}/verify`,
    restore: (paymentId: string) => `/payments/${paymentId}/restore`,
  },

  expenses: {
    base: "/expenses",

    byId: (expenseId: string) => `/expenses/${expenseId}`,
    restore: (expenseId: string) => `/expenses/${expenseId}/restore`,
  },

  contracts: {
    base: "/contracts",
    byId: (contractId: string) => `/contracts/${contractId}`,
    summary: (contractId: string) => `/contracts/${contractId}/summary`,
    restore: (contractId: string) => `/contracts/${contractId}/restore`,
  },

  supplierAgreements: {
    base: "/supplier-agreements",

    byId: (agreementId: string) => `/supplier-agreements/${agreementId}`,
    summary: (agreementId: string) =>
      `/supplier-agreements/${agreementId}/summary`,
    restore: (agreementId: string) =>
      `/supplier-agreements/${agreementId}/restore`,
  },

  receipts: {
    base: "/receipts",

    byId: (receiptId: string) => `/receipts/${receiptId}`,
    preview: (receiptId: string) => `/receipts/${receiptId}/preview`,
    link: (receiptId: string) => `/receipts/${receiptId}/link`,
    unlink: (receiptId: string) => `/receipts/${receiptId}/unlink`,
    restore: (receiptId: string) => `/receipts/${receiptId}/restore`,
  },

  dashboard: "/dashboard",
} as const;
