import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createMaterialReceiptController,
  deleteMaterialReceiptController,
  getMaterialReceiptController,
  listMaterialReceiptsController,
  restoreMaterialReceiptController,
  updateMaterialReceiptController,
  verifyMaterialReceiptController,
} from "../controllers/materialReceipt.controller";

import {
  createMaterialReceiptSchema,
  deleteMaterialReceiptSchema,
  getMaterialReceiptSchema,
  listMaterialReceiptsSchema,
  restoreMaterialReceiptSchema,
  updateMaterialReceiptSchema,
  verifyMaterialReceiptSchema,
} from "../validators/materialReceipt.schema";

const router = Router();

/*
 * All material receipt APIs require authentication.
 */
router.use(authenticate);

/* =========================================================
   CREATE
   POST /api/material-receipts
========================================================= */

router.post(
  "/",
  validate(createMaterialReceiptSchema),
  createMaterialReceiptController,
);

/* =========================================================
   LIST
   GET /api/material-receipts
========================================================= */

router.get(
  "/",
  validate(listMaterialReceiptsSchema),
  listMaterialReceiptsController,
);

/* =========================================================
   GET BY ID
   GET /api/material-receipts/:materialReceiptId
========================================================= */

router.get(
  "/:materialReceiptId",
  validate(getMaterialReceiptSchema),
  getMaterialReceiptController,
);

/* =========================================================
   RESTORE
   PATCH /api/material-receipts/:materialReceiptId/restore

   IMPORTANT:
   This must come before generic PATCH /:materialReceiptId.
========================================================= */

router.patch(
  "/:materialReceiptId/restore",
  validate(restoreMaterialReceiptSchema),
  restoreMaterialReceiptController,
);

/* =========================================================
   VERIFY
   PATCH /api/material-receipts/:materialReceiptId/verify
========================================================= */

router.patch(
  "/:materialReceiptId/verify",
  validate(verifyMaterialReceiptSchema),
  verifyMaterialReceiptController,
);

/* =========================================================
   UPDATE
   PATCH /api/material-receipts/:materialReceiptId
========================================================= */

router.patch(
  "/:materialReceiptId",
  validate(updateMaterialReceiptSchema),
  updateMaterialReceiptController,
);

/* =========================================================
   DELETE
   DELETE /api/material-receipts/:materialReceiptId
========================================================= */

router.delete(
  "/:materialReceiptId",
  validate(deleteMaterialReceiptSchema),
  deleteMaterialReceiptController,
);

export default router;
