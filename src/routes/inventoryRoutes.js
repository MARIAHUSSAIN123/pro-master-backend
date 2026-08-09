import express from "express";

import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  stockIn,
  stockOut,
  assignItem,
  unassignItem,
  logMaintenance,
  getLowStockItems,
} from "../controllers/inventoryController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Inventory / Equipment Routes
// ======================================

// Low stock alerts — must be registered before "/:id"
router.get(
  "/low-stock",
  protect,
  authorize("admin", "manager"),
  getLowStockItems
);

// Create Item
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createItem
);

// Get All Items
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getItems
);

// Get Single Item
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getItemById
);

// Update Item
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateItem
);

// Delete Item
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteItem
);

// Stock In
router.post(
  "/:id/stock-in",
  protect,
  authorize("admin", "manager"),
  stockIn
);

// Stock Out
router.post(
  "/:id/stock-out",
  protect,
  authorize("admin", "manager"),
  stockOut
);

// Assign To Employee
router.post(
  "/:id/assign",
  protect,
  authorize("admin", "manager"),
  assignItem
);

// Unassign From Employee
router.post(
  "/:id/unassign",
  protect,
  authorize("admin", "manager"),
  unassignItem
);

// Log / Update Maintenance
router.post(
  "/:id/maintenance",
  protect,
  authorize("admin", "manager"),
  logMaintenance
);

export default router;