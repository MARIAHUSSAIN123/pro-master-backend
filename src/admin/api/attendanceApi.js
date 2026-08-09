import API from "./axios";

// GET /api/attendance
export const getAttendance = async () => {
  const { data } = await API.get("/attendance");
  return data;
};

// GET /api/attendance/:id
export const getAttendanceById = async (id) => {
  const { data } = await API.get(`/attendance/${id}`);
  return data;
};

// POST /api/attendance  (Mark Attendance)
export const markAttendance = async (payload) => {
  const { data } = await API.post("/attendance", payload);
  return data;
};

// PUT /api/attendance/:id
export const updateAttendance = async (id, payload) => {
  const { data } = await API.put(`/attendance/${id}`, payload);
  return data;
};

// DELETE /api/attendance/:id
export const deleteAttendance = async (id) => {
  const { data } = await API.delete(`/attendance/${id}`);
  return data;
};

// PATCH /api/attendance/:id/checkin
export const checkInEmployee = async (id, coords = {}) => {
  const { data } = await API.patch(`/attendance/${id}/checkin`, coords);
  return data;
};

// PATCH /api/attendance/:id/checkout
export const checkOutEmployee = async (id, coords = {}) => {
  const { data } = await API.patch(`/attendance/${id}/checkout`, coords);
  return data;
};
