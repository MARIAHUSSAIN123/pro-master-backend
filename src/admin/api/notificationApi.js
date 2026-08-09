import API from "./axios";

// GET /api/notifications — the logged-in user's own notifications
// (works for admin/manager/employee/accounting/customer alike, since
// Spec 3.8 covers all app clients through the same endpoint).
export const getMyNotifications = async (params = {}) => {
  const { data } = await API.get("/notifications", { params });
  return data; // { success, unreadCount, totalNotifications, notifications }
};

export const getNotificationById = async (id) => {
  const { data } = await API.get(`/notifications/${id}`);
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await API.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await API.put("/notifications/read-all");
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await API.delete(`/notifications/${id}`);
  return data;
};

// Admin/Manager — manually trigger a notification to one user
export const createNotification = async (payload) => {
  const { data } = await API.post("/notifications", payload);
  return data;
};

// Admin/Manager — send the same notification to several users at once
export const createBulkNotification = async (payload) => {
  const { data } = await API.post("/notifications/bulk", payload);
  return data;
};
