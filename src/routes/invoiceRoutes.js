import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markInvoicePaid,
  getInvoiceStatistics,
  getInvoiceRevenue,
  getMyInvoices,
} from "../controllers/invoiceController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Customer Portal (Spec 3.2)
// ======================================
router.get("/me", protect, authorize("customer"), getMyInvoices);

// ======================================
// Dashboard
// ======================================

// Invoice Statistics
router.get(
  "/statistics",
  protect,
  authorize("admin", "manager", "accounting"),
  getInvoiceStatistics
);

// Revenue Report
router.get(
  "/revenue",
  protect,
  authorize("admin", "accounting"),
  getInvoiceRevenue
);

// ======================================
// CRUD
// ======================================

// Create Invoice
router.post(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  createInvoice
);

// Get All Invoices
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getInvoices
);

// Get Single Invoice
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getInvoiceById
);

// Update Invoice
router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  updateInvoice
);

// Delete Invoice
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteInvoice
);

// ======================================
// Payment
// ======================================

// Mark Invoice Paid
router.patch(
  "/paid/:id",
  protect,
  authorize("admin", "accounting"),
  markInvoicePaid
);

export default router;
