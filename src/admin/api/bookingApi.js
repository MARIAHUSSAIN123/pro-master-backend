import API from "./axios";

// GET /api/bookings
export const getBookings = async () => {
  const { data } = await API.get("/bookings");
  return data;
};

// GET /api/bookings/:id
export const getBookingById = async (id) => {
  const { data } = await API.get(`/bookings/${id}`);
  return data;
};

// POST /api/bookings
export const createBooking = async (payload) => {
  const { data } = await API.post("/bookings", payload);
  return data;
};

// PUT /api/bookings/:id
export const updateBooking = async (id, payload) => {
  const { data } = await API.put(`/bookings/${id}`, payload);
  return data;
};

// DELETE /api/bookings/:id
export const deleteBooking = async (id) => {
  const { data } = await API.delete(`/bookings/${id}`);
  return data;
};

// PUT /api/bookings/:id/assign  { employeeIds: [] }
export const assignEmployees = async (id, employeeIds) => {
  const { data } = await API.put(`/bookings/${id}/assign`, { employeeIds });
  return data;
};

// PUT /api/bookings/:id/status  { status }
export const updateBookingStatus = async (id, status) => {
  const { data } = await API.put(`/bookings/${id}/status`, { status });
  return data;
};

// PUT /api/bookings/:id/payment  { paymentStatus }
export const updatePaymentStatus = async (id, paymentStatus) => {
  const { data } = await API.put(`/bookings/${id}/payment`, { paymentStatus });
  return data;
};

// GET /api/bookings/statistics
export const getBookingStatistics = async () => {
  const { data } = await API.get("/bookings/statistics");
  return data;
};

// GET /api/bookings/:id/suggest-assignment
export const suggestAssignment = async (id) => {
  const { data } = await API.get(`/bookings/${id}/suggest-assignment`);
  return data;
};

// POST /api/bookings/:id/auto-assign
export const autoAssignBooking = async (id) => {
  const { data } = await API.post(`/bookings/${id}/auto-assign`);
  return data;
};
