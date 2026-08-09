import API from "./axios";

// GET /api/invoices
export const getInvoices = async () => {
  const { data } = await API.get("/invoices");
  return data;
};

// GET /api/invoices/:id
export const getInvoiceById = async (id) => {
  const { data } = await API.get(`/invoices/${id}`);
  return data;
};

// POST /api/invoices
export const createInvoice = async (payload) => {
  const { data } = await API.post("/invoices", payload);
  return data;
};

// PUT /api/invoices/:id
export const updateInvoice = async (id, payload) => {
  const { data } = await API.put(`/invoices/${id}`, payload);
  return data;
};

// DELETE /api/invoices/:id
export const deleteInvoice = async (id) => {
  const { data } = await API.delete(`/invoices/${id}`);
  return data;
};

// PATCH /api/invoices/paid/:id
export const markInvoicePaid = async (id, payload = {}) => {
  const { data } = await API.patch(`/invoices/paid/${id}`, payload);
  return data;
};

// GET /api/invoices/statistics
export const getInvoiceStatistics = async () => {
  const { data } = await API.get("/invoices/statistics");
  return data;
};

// GET /api/invoices/revenue
export const getInvoiceRevenue = async () => {
  const { data } = await API.get("/invoices/revenue");
  return data;
};
