import API from "./axios";

// GET /api/payments
export const getPayments = async () => {
  const { data } = await API.get("/payments");
  return data;
};

// GET /api/payments/statistics
export const getPaymentStatistics = async () => {
  const { data } = await API.get("/payments/statistics");
  return data;
};

// GET /api/payments/revenue
export const getPaymentRevenue = async () => {
  const { data } = await API.get("/payments/revenue");
  return data;
};

// PATCH /api/payments/refund/:id
export const refundPayment = async (id) => {
  const { data } = await API.patch(`/payments/refund/${id}`);
  return data;
};
