import API from "./axios";

// GET /api/inventory
export const getInventoryItems = async () => {
  const { data } = await API.get("/inventory");
  return data;
};

// GET /api/inventory/low-stock
export const getLowStockItems = async () => {
  const { data } = await API.get("/inventory/low-stock");
  return data;
};

// GET /api/inventory/:id
export const getInventoryItemById = async (id) => {
  const { data } = await API.get(`/inventory/${id}`);
  return data;
};

// POST /api/inventory
export const createInventoryItem = async (payload) => {
  const { data } = await API.post("/inventory", payload);
  return data;
};

// PUT /api/inventory/:id
export const updateInventoryItem = async (id, payload) => {
  const { data } = await API.put(`/inventory/${id}`, payload);
  return data;
};

// DELETE /api/inventory/:id
export const deleteInventoryItem = async (id) => {
  const { data } = await API.delete(`/inventory/${id}`);
  return data;
};

// POST /api/inventory/:id/stock-in
export const stockIn = async (id, payload) => {
  const { data } = await API.post(`/inventory/${id}/stock-in`, payload);
  return data;
};

// POST /api/inventory/:id/stock-out
export const stockOut = async (id, payload) => {
  const { data } = await API.post(`/inventory/${id}/stock-out`, payload);
  return data;
};

// POST /api/inventory/:id/assign
export const assignInventoryItem = async (id, employeeId) => {
  const { data } = await API.post(`/inventory/${id}/assign`, { employeeId });
  return data;
};

// POST /api/inventory/:id/unassign
export const unassignInventoryItem = async (id) => {
  const { data } = await API.post(`/inventory/${id}/unassign`);
  return data;
};

// POST /api/inventory/:id/maintenance
export const logMaintenance = async (id, payload) => {
  const { data } = await API.post(`/inventory/${id}/maintenance`, payload);
  return data;
};
