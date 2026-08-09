import API from "../api/axios";

export const getDashboard = async () => {
  const response = await API.get("/dashboard");
  return response.data;
};