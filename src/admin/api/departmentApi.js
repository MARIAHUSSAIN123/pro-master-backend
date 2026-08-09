import API from "./axios";

// GET /api/departments
export const getDepartments = async () => {
  const { data } = await API.get("/departments");
  return data;
};

// GET /api/departments/:id
export const getDepartmentById = async (id) => {
  const { data } = await API.get(`/departments/${id}`);
  return data;
};

// POST /api/departments
export const createDepartment = async (payload) => {
  const { data } = await API.post("/departments", payload);
  return data;
};

// PUT /api/departments/:id
export const updateDepartment = async (id, payload) => {
  const { data } = await API.put(`/departments/${id}`, payload);
  return data;
};

// DELETE /api/departments/:id
export const deleteDepartment = async (id) => {
  const { data } = await API.delete(`/departments/${id}`);
  return data;
};