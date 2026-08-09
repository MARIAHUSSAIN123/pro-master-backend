import express from "express";

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  assignEmployees,
  updateBookingStatus,
  updatePaymentStatus,
  getTodaysBookings,
  getUpcomingBookings,
  getBookingStatistics,
  getRevenueSummary,
  getMonthlyRevenue,
  getRecentBookings,
  createMyBooking,
  getMyBookings,
  getMyAssignedBookings,
  checkInBooking,
  submitServiceReport,
  suggestAssignment,
  autoAssignBooking,
  getSchedulingAlerts,
} from "../controllers/bookingController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Customer Portal (Spec 3.2 — request services, view service calls)
// ======================================
router.post("/me", protect, authorize("customer"), createMyBooking);
router.get("/me", protect, authorize("customer"), getMyBookings);

// ======================================
// Field Agent (mobile app) — own assigned jobs
// (Spec 3.3 — geolocated check-in/out, service report, photos, signature)
// ======================================
router.get(
  "/me/assigned",
  protect,
  authorize("employee"),
  getMyAssignedBookings
);
router.put(
  "/:id/checkin",
  protect,
  authorize("employee"),
  checkInBooking
);
router.put(
  "/:id/service-report",
  protect,
  authorize("employee"),
  submitServiceReport
);

// ======================================
// Dashboard Statistics
// ======================================

router.get(
  "/statistics",
  protect,
  authorize("admin", "manager", "accounting"),
  getBookingStatistics
);

router.get(
  "/revenue",
  protect,
  authorize("admin", "accounting"),
  getRevenueSummary
);

router.get(
  "/monthly-revenue",
  protect,
  authorize("admin", "accounting"),
  getMonthlyRevenue
);

router.get(
  "/recent",
  protect,
  authorize("admin", "manager"),
  getRecentBookings
);

router.get(
  "/today",
  protect,
  authorize("admin", "manager"),
  getTodaysBookings
);

router.get(
  "/upcoming",
  protect,
  authorize("admin", "manager"),
  getUpcomingBookings
);

// Understaffing / overstaffing / scheduling alerts (Spec 3.4)
// Must stay above "/:id" — it's a static path, not a booking id.
router.get(
  "/scheduling-alerts",
  protect,
  authorize("admin", "manager"),
  getSchedulingAlerts
);

// ======================================
// Booking CRUD
// ======================================

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createBooking
);

router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getBookings
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getBookingById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateBooking
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBooking
);

// ======================================
// Booking Actions
// ======================================

// Smart Assignment Engine (Spec 3.4)
// Suggest best-ranked agents (does not commit)
router.get(
  "/:id/suggest-assignment",
  protect,
  authorize("admin", "manager"),
  suggestAssignment
);

// Auto-assign the top-ranked agent(s)
router.post(
  "/:id/auto-assign",
  protect,
  authorize("admin", "manager"),
  autoAssignBooking
);

// Assign Employees

router.put(
  "/:id/assign",
  protect,
  authorize("admin", "manager"),
  assignEmployees
);

// Update Booking Status

router.put(
  "/:id/status",
  protect,
  authorize("admin", "manager"),
  updateBookingStatus
);

// Update Payment Status

router.put(
  "/:id/payment",
  protect,
  authorize("admin", "accounting"),
  updatePaymentStatus
);

export default router;
