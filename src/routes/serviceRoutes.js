import express from "express";

import {
  createService,
  getServices,
  getActiveServices,
  getFeaturedServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Public Routes (Customer Website)
// ======================================

// Get All Active Services
router.get(
  "/active",
  getActiveServices
);

// Get Featured Services
router.get(
  "/featured",
  getFeaturedServices
);

// ======================================
// Admin / Manager Routes
// ======================================

// Create Service
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createService
);

// Get All Services (Dashboard)
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getServices
);

// Get Single Service
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getServiceById
);

// Update Service
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateService
);

// Delete Service
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteService
);

export default router;