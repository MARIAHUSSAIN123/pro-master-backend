import express from "express";
import {
  getDashboardStats,
  exportBookingsCSV,
  exportInvoicesCSV,
  exportBookingsExcel,
  exportInvoicesExcel,
  exportBookingsPDF,
  exportInvoicesPDF,
  getBIReport,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Main dashboard stats
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getDashboardStats
);

// CSV export of bookings (Spec 3.9 - data exports)
router.get(
  "/export/bookings",
  protect,
  authorize("admin", "manager", "accounting"),
  exportBookingsCSV
);

// CSV export of invoices (Spec 3.9 - data exports)
router.get(
  "/export/invoices",
  protect,
  authorize("admin", "manager", "accounting"),
  exportInvoicesCSV
);

// Excel export of bookings / invoices (Spec 3.9 - data exports)
router.get(
  "/export/bookings/excel",
  protect,
  authorize("admin", "manager", "accounting"),
  exportBookingsExcel
);
router.get(
  "/export/invoices/excel",
  protect,
  authorize("admin", "manager", "accounting"),
  exportInvoicesExcel
);

// PDF export of bookings / invoices (Spec 3.9 - data exports)
router.get(
  "/export/bookings/pdf",
  protect,
  authorize("admin", "manager", "accounting"),
  exportBookingsPDF
);
router.get(
  "/export/invoices/pdf",
  protect,
  authorize("admin", "manager", "accounting"),
  exportInvoicesPDF
);

// Reporting API for external BI tool (Spec 3.9)
router.get(
  "/reports/bi",
  protect,
  authorize("admin", "manager", "accounting"),
  getBIReport
);

export default router;
