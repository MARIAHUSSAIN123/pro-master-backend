import API from "./axios";

// GET /api/services
export const getServices = async () => {
  const { data } = await API.get("/services");
  return data;
};

// GET /api/services/active (public list of active services)
export const getActiveServices = async () => {
  const { data } = await API.get("/services/active");
  return data;
};

// GET /api/services/:id
export const getServiceById = async (id) => {
  const { data } = await API.get(`/services/${id}`);
  return data;
};

// POST /api/services
export const createService = async (payload) => {
  const { data } = await API.post("/services", payload);
  return data;
};

// PUT /api/services/:id
export const updateService = async (id, payload) => {
  const { data } = await API.put(`/services/${id}`, payload);
  return data;
};

// DELETE /api/services/:id
export const deleteService = async (id) => {
  const { data } = await API.delete(`/services/${id}`);
  return data;
};
