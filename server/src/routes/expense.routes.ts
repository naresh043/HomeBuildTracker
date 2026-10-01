import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createExpenseController,
  deleteExpenseController,
  getExpenseController,
  listExpensesController,
  restoreExpenseController,
  updateExpenseController,
} from "../controllers/expense.controller";
import {
  createExpenseSchema,
  deleteExpenseSchema,
  getExpenseSchema,
  listExpensesSchema,
  restoreExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.schema";

const router = Router();

router.use(authenticate);

router.post("/", validate(createExpenseSchema), createExpenseController);

router.get("/", validate(listExpensesSchema), listExpensesController);

router.get("/:expenseId", validate(getExpenseSchema), getExpenseController);

router.patch(
  "/:expenseId/restore",
  validate(restoreExpenseSchema),
  restoreExpenseController,
);

router.patch(
  "/:expenseId",
  validate(updateExpenseSchema),
  updateExpenseController,
);

router.delete(
  "/:expenseId",
  validate(deleteExpenseSchema),
  deleteExpenseController,
);

export default router;
