import API from "./axios";

// GET /api/employees
export const getEmployees = async () => {
  const { data } = await API.get("/employees");
  return data;
};

// GET /api/employees/:id
export const getEmployeeById = async (id) => {
  const { data } = await API.get(`/employees/${id}`);
  return data;
};

// POST /api/employees
export const createEmployee = async (payload) => {
  const { data } = await API.post("/employees", payload);
  return data;
};

// PUT /api/employees/:id
export const updateEmployee = async (id, payload) => {
  const { data } = await API.put(`/employees/${id}`, payload);
  return data;
};

// DELETE /api/employees/:id
export const deleteEmployee = async (id) => {
  const { data } = await API.delete(`/employees/${id}`);
  return data;
};