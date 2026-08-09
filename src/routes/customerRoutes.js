import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getMyCustomerProfile,
  getCustomerDashboard,
  updateMyCustomerProfile,
} from "../controllers/customerController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Customer Portal (self-service)
// Must come before "/:id" routes so "me" isn't treated as an id.
// ======================================
router.get("/me", protect, authorize("customer"), getMyCustomerProfile);
router.put("/me", protect, authorize("customer"), updateMyCustomerProfile);

// ======================================
// Staff Customer Routes
// ======================================

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createCustomer
);

router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getCustomers
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getCustomerById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateCustomer
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCustomer
);
router.get(
  "/:id/dashboard",
  protect,
  authorize("admin", "manager", "accounting"),
  getCustomerDashboard
);
export default router;
