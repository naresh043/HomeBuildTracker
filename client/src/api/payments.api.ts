import  apiClient  from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreatePaymentRequest,
  PaymentListResponse,
  PaymentResponse,
  PaymentQueryParams,
  UpdatePaymentRequest,
} from "@/features/payments/payment.types";

export const createPayment = async (
  payload: CreatePaymentRequest,
): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(
    API_ENDPOINTS.payments.base,
    payload,
  );

  return response.data;
};

export const getPayments = async (
  params?: PaymentQueryParams,
): Promise<PaymentListResponse> => {
  const response = await apiClient.get<PaymentListResponse>(
    API_ENDPOINTS.payments.base,
    {
      params,
    },
  );

  return response.data;
};

export const getPayment = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.get<PaymentResponse>(
    API_ENDPOINTS.payments.byId(paymentId),
  );

  return response.data;
};

export const updatePayment = async (
  paymentId: string,
  payload: UpdatePaymentRequest,
): Promise<PaymentResponse> => {
  const response = await apiClient.patch<PaymentResponse>(
    API_ENDPOINTS.payments.byId(paymentId),
    payload,
  );

  return response.data;
};

export const verifyPayment = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.patch<PaymentResponse>(
    API_ENDPOINTS.payments.verify(paymentId),
  );

  return response.data;
};

export const deletePayment = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.delete<PaymentResponse>(
    API_ENDPOINTS.payments.byId(paymentId),
  );

  return response.data;
};

export const restorePayment = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.patch<PaymentResponse>(
    API_ENDPOINTS.payments.restore(paymentId),
  );

  return response.data;
};
