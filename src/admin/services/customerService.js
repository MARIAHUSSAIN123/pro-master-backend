import API from "./api";

// GET /api/customers
export const getCustomers = async () => {
  const response = await API.get("/customers");
  return response.data;
};

// GET /api/customers/:id
export const getCustomerById = async (id) => {
  const response = await API.get(`/customers/${id}`);
  return response.data;
};

// POST /api/customers
export const createCustomer = async (payload) => {
  const response = await API.post("/customers", payload);
  return response.data;
};

// PUT /api/customers/:id
export const updateCustomer = async (id, payload) => {
  const response = await API.put(`/customers/${id}`, payload);
  return response.data;
};

// DELETE /api/customers/:id
export const deleteCustomer = async (id) => {
  const response = await API.delete(`/customers/${id}`);
  return response.data;
};
