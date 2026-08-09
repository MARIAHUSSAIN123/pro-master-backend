import express from "express";

import {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  checkInEmployee,
  checkOutEmployee,
} from "../controllers/attendanceController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================
// Attendance CRUD
// ======================================

// Mark Attendance
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  markAttendance
);

// Get All Attendance
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  getAttendance
);

// Get Single Attendance
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  getAttendanceById
);

// Update Attendance
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateAttendance
);

// Delete Attendance
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteAttendance
);


// ======================================
// Employee Actions
// ======================================

// Employee Check In
router.patch(
  "/:id/checkin",
  protect,
  authorize("employee", "admin", "manager"),
  checkInEmployee
);

// Employee Check Out
router.patch(
  "/:id/checkout",
  protect,
  authorize("employee", "admin", "manager"),
  checkOutEmployee
);

export default router;