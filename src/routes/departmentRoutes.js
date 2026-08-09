import express from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Department Routes
// ======================================

// Create Department
router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartment
);

// Get All Departments
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getDepartments
);

// Get Single Department
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getDepartmentById
);

// Update Department
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateDepartment
);

// Delete Department
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteDepartment
);

export default router;