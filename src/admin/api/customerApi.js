import API from "./axios";

// GET /api/customers
export const getCustomers = async () => {
  const { data } = await API.get("/customers");
  return data;
};

// GET /api/customers/:id
export const getCustomerById = async (id) => {
  const { data } = await API.get(`/customers/${id}`);
  return data;
};

// POST /api/customers
export const createCustomer = async (payload) => {
  const { data } = await API.post("/customers", payload);
  return data;
};

// PUT /api/customers/:id
export const updateCustomer = async (id, payload) => {
  const { data } = await API.put(`/customers/${id}`, payload);
  return data;
};

// DELETE /api/customers/:id
export const deleteCustomer = async (id) => {
  const { data } = await API.delete(`/customers/${id}`);
  return data;
};