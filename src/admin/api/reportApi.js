import API from "./axios";

// GET /api/dashboard — full stats used to power the Reports page
export const getDashboardStats = async () => {
  const { data } = await API.get("/dashboard");
  return data;
};

// Generic authenticated file download helper. The export endpoints
// require the auth token, so a plain <a href> won't work — we fetch
// the file as a blob (with the token attached by the axios interceptor)
// and trigger the browser download manually.
const downloadFile = async (url, fallbackName) => {
  const response = await API.get(url, { responseType: "blob" });

  const disposition = response.headers["content-disposition"];
  const match = disposition && disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : fallbackName;

  const blobUrl = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
};

export const exportBookingsCSV = () => downloadFile("/dashboard/export/bookings", "bookings.csv");
export const exportBookingsExcel = () => downloadFile("/dashboard/export/bookings/excel", "bookings.xls");
export const exportBookingsPDF = () => downloadFile("/dashboard/export/bookings/pdf", "bookings.pdf");

export const exportInvoicesCSV = () => downloadFile("/dashboard/export/invoices", "invoices.csv");
export const exportInvoicesExcel = () => downloadFile("/dashboard/export/invoices/excel", "invoices.xls");
export const exportInvoicesPDF = () => downloadFile("/dashboard/export/invoices/pdf", "invoices.pdf");
