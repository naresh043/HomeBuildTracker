import { Router } from "express";

import {
  createVendorController,
  deleteVendorController,
  getActiveVendorsController,
  getVendorController,
  listVendorsController,
  restoreVendorController,
  updateVendorController,
} from "../controllers/vendor.controller";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createVendorSchema,
  deleteVendorSchema,
  getVendorSchema,
  listVendorsSchema,
  updateVendorSchema,
} from "../validators/vendor.schema";

const router = Router();

router.use(authenticate);

// POST /api/vendors
router.post("/", validate(createVendorSchema), createVendorController);

// GET /api/vendors
router.get("/", validate(listVendorsSchema), listVendorsController);

// GET /api/vendors/active
// Must be before /:vendorId
router.get("/active", getActiveVendorsController);

// GET /api/vendors/:vendorId
router.get("/:vendorId", validate(getVendorSchema), getVendorController);

// PATCH /api/vendors/:vendorId/restore
// Must be before PATCH /:vendorId
router.patch(
  "/:vendorId/restore",
  validate(getVendorSchema),
  restoreVendorController,
);

// PATCH /api/vendors/:vendorId
router.patch(
  "/:vendorId",
  validate(updateVendorSchema),
  updateVendorController,
);

// DELETE /api/vendors/:vendorId
router.delete(
  "/:vendorId",
  validate(deleteVendorSchema),
  deleteVendorController,
);

export default router;
