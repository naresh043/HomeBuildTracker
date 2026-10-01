import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createPaymentController,
  deletePaymentController,
  getPaymentController,
  listPaymentsController,
  restorePaymentController,
  updatePaymentController,
  verifyPaymentController,
} from "../controllers/payment.controller";
import {
  createPaymentSchema,
  deletePaymentSchema,
  getPaymentSchema,
  listPaymentsSchema,
  restorePaymentSchema,
  updatePaymentSchema,
  verifyPaymentSchema,
} from "../validators/payment.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createPaymentSchema), createPaymentController);

router.get("/", validate(listPaymentsSchema), listPaymentsController);

router.get("/:paymentId", validate(getPaymentSchema), getPaymentController);

router.patch(
  "/:paymentId/restore",
  validate(restorePaymentSchema),
  restorePaymentController,
);

router.patch(
  "/:paymentId/verify",
  validate(verifyPaymentSchema),
  verifyPaymentController,
);

router.patch(
  "/:paymentId",
  validate(updatePaymentSchema),
  updatePaymentController,
);

router.delete(
  "/:paymentId",
  validate(deletePaymentSchema),
  deletePaymentController,
);

export default router;
