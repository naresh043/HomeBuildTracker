import { RequestHandler } from "express";
import { Types } from "mongoose";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  listPayments,
  restorePayment,
  updatePayment,
  verifyPayment,
} from "../services/payment.service";
import { successResponse } from "../utils/response";
import { ApiError } from "../utils/ApiError";

const getValidated = (req: any) => {
  if (!req.validated) {
    throw new ApiError(
      500,
      "Validated request data is missing",
      "VALIDATED_DATA_MISSING",
    );
  }

  return req.validated;
};

/**
 * ============================================================
 * CREATE PAYMENT
 * ============================================================
 */
export const createPaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    if (!req.user?._id) {
      return next(
        new ApiError(401, "Authentication required", "UNAUTHENTICATED"),
      );
    }

    const payment = await createPayment(
      validated.body,
      req.user._id as Types.ObjectId,
    );

    return res
      .status(201)
      .json(successResponse(payment, "Payment created successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * LIST PAYMENTS
 * ============================================================
 */
export const listPaymentsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const result = await listPayments(validated.query);

    return res
      .status(200)
      .json(successResponse(result, "Payments fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * GET PAYMENT
 * ============================================================
 */
export const getPaymentController: RequestHandler = async (req, res, next) => {
  try {
    const validated = getValidated(req);

    const payment = await getPaymentById(
      validated.params.paymentId,
      validated.query.includeDeleted,
    );

    return res
      .status(200)
      .json(successResponse(payment, "Payment fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * UPDATE PAYMENT
 * ============================================================
 */
export const updatePaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const payment = await updatePayment(
      validated.params.paymentId,
      validated.body,
    );

    return res
      .status(200)
      .json(successResponse(payment, "Payment updated successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * DELETE PAYMENT
 * ============================================================
 */
export const deletePaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const payment = await deletePayment(validated.params.paymentId);

    return res
      .status(200)
      .json(successResponse(payment, "Payment deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * RESTORE PAYMENT
 * ============================================================
 */
export const restorePaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const payment = await restorePayment(validated.params.paymentId);

    return res
      .status(200)
      .json(successResponse(payment, "Payment restored successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * VERIFY PAYMENT
 * ============================================================
 */
export const verifyPaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const payment = await verifyPayment(validated.params.paymentId);

    return res
      .status(200)
      .json(successResponse(payment, "Payment verified successfully"));
  } catch (error) {
    return next(error);
  }
};
