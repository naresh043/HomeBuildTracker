// src/routes/material.routes.ts

import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createMaterialController,
  deleteMaterialController,
  getMaterialController,
  listMaterialsController,
  restoreMaterialController,
  updateMaterialController,
} from "../controllers/material.controller";

import {
  createMaterialSchema,
  deleteMaterialSchema,
  getMaterialSchema,
  listMaterialsSchema,
  restoreMaterialSchema,
  updateMaterialSchema,
} from "../validators/material.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createMaterialSchema), createMaterialController);

router.get("/", validate(listMaterialsSchema), listMaterialsController);

router.get("/:materialId", validate(getMaterialSchema), getMaterialController);

router.patch(
  "/:materialId/restore",
  validate(restoreMaterialSchema),
  restoreMaterialController,
);

router.patch(
  "/:materialId",
  validate(updateMaterialSchema),
  updateMaterialController,
);

router.delete(
  "/:materialId",
  validate(deleteMaterialSchema),
  deleteMaterialController,
);

export default router;
