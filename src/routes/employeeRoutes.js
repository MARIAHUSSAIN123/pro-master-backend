import express from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Employee Routes
// ======================================

// Create Employee
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createEmployee
);

// Get All Employees
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getEmployees
);

// Get Single Employee
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getEmployeeById
);

// Update Employee
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateEmployee
);

// Delete Employee
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteEmployee
);

export default router;