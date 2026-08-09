import API from "./axios";

// POST /api/auth/login — returns { success, message, token, user }
export const loginRequest = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  return data;
};

// GET /api/auth/profile — currently logged-in user (requires token)
export const getProfileRequest = async () => {
  const { data } = await API.get("/auth/profile");
  return data;
};

// PUT /api/auth/profile — update own name / phone / photo
export const updateProfileRequest = async (payload) => {
  const { data } = await API.put("/auth/profile", payload);
  return data;
};

// PUT /api/auth/change-password
export const changePasswordRequest = async (currentPassword, newPassword) => {
  const { data } = await API.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};