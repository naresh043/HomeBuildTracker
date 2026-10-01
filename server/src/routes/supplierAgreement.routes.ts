import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createSupplierAgreementSchema,
  deleteSupplierAgreementSchema,
  getSupplierAgreementSchema,
  listSupplierAgreementsSchema,
  restoreSupplierAgreementSchema,
  supplierAgreementSummarySchema,
  updateSupplierAgreementSchema,
} from "../validators/supplierAgreement.schema";

import {
  createSupplierAgreementController,
  deleteSupplierAgreementController,
  getSupplierAgreementController,
  getSupplierAgreementSummaryController,
  listSupplierAgreementsController,
  restoreSupplierAgreementController,
  updateSupplierAgreementController,
} from "../controllers/supplierAgreement.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createSupplierAgreementSchema),
  createSupplierAgreementController,
);

router.get(
  "/",
  validate(listSupplierAgreementsSchema),
  listSupplierAgreementsController,
);

router.get(
  "/:agreementId/summary",
  validate(supplierAgreementSummarySchema),
  getSupplierAgreementSummaryController,
);

router.get(
  "/:agreementId",
  validate(getSupplierAgreementSchema),
  getSupplierAgreementController,
);

router.patch(
  "/:agreementId/restore",
  validate(restoreSupplierAgreementSchema),
  restoreSupplierAgreementController,
);

router.patch(
  "/:agreementId",
  validate(updateSupplierAgreementSchema),
  updateSupplierAgreementController,
);

router.delete(
  "/:agreementId",
  validate(deleteSupplierAgreementSchema),
  deleteSupplierAgreementController,
);

export default router;
