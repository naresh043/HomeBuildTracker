import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createContractController,
  deleteContractController,
  getContractController,
  getContractSummaryController,
  listContractsController,
  restoreContractController,
  updateContractController,
} from "../controllers/contract.controller";

import {
  contractSummarySchema,
  createContractSchema,
  deleteContractSchema,
  getContractSchema,
  listContractsSchema,
  restoreContractSchema,
  updateContractSchema,
} from "../validators/contract.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createContractSchema), createContractController);

router.get("/", validate(listContractsSchema), listContractsController);

router.get(
  "/:contractId/summary",
  validate(contractSummarySchema),
  getContractSummaryController,
);

router.get("/:contractId", validate(getContractSchema), getContractController);

router.patch(
  "/:contractId/restore",
  validate(restoreContractSchema),
  restoreContractController,
);

router.patch(
  "/:contractId",
  validate(updateContractSchema),
  updateContractController,
);

router.delete(
  "/:contractId",
  validate(deleteContractSchema),
  deleteContractController,
);

export default router;
