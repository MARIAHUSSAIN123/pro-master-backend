import API from "./axios";

// GET /api/quotes
export const getQuotes = async () => {
  const { data } = await API.get("/quotes");
  return data;
};

// GET /api/quotes/:id
export const getQuoteById = async (id) => {
  const { data } = await API.get(`/quotes/${id}`);
  return data;
};

// POST /api/quotes
export const createQuote = async (payload) => {
  const { data } = await API.post("/quotes", payload);
  return data;
};

// PUT /api/quotes/:id
export const updateQuote = async (id, payload) => {
  const { data } = await API.put(`/quotes/${id}`, payload);
  return data;
};

// DELETE /api/quotes/:id
export const deleteQuote = async (id) => {
  const { data } = await API.delete(`/quotes/${id}`);
  return data;
};

// PATCH /api/quotes/:id/send  — Draft -> Sent
export const sendQuote = async (id) => {
  const { data } = await API.patch(`/quotes/${id}/send`);
  return data;
};

// PATCH /api/quotes/:id/convert — Accepted -> Booking(s) or Contract
export const convertQuote = async (id, payload) => {
  const { data } = await API.patch(`/quotes/${id}/convert`, payload);
  return data;
};

// GET /api/quotes/statistics
export const getQuoteStatistics = async () => {
  const { data } = await API.get("/quotes/statistics");
  return data;
};
