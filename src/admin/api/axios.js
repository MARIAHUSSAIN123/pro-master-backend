import axios from "axios";

// Local dev: create a .env file in the frontend root with
//   VITE_API_URL=http://localhost:5000/api
// Production (Vercel): set VITE_API_URL to your deployed backend URL,
// e.g. https://your-backend.vercel.app/api
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://pro-master-backend.vercel.app/api",
});

// Attach the JWT (if we have one) to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the backend says our token is invalid/expired, clear it and
// send the user back to login instead of leaving them stuck on a
// broken page.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;