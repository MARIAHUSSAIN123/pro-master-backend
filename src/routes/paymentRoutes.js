import express from "express";

import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  refundPayment,
  getPaymentStatistics,
  getPaymentRevenue,
  createPaymentIntent,
  confirmStripePayment,
  refundStripePayment,
   createSetupIntent,
  confirmSetupIntent
} from "../controllers/paymentController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Dashboard / Reports
// ======================================

// Payment Statistics
router.get(
  "/statistics",
  protect,
  authorize("admin", "manager", "accounting"),
  getPaymentStatistics
);

// Revenue Summary
router.get(
  "/revenue",
  protect,
  authorize("admin", "accounting"),
  getPaymentRevenue
);

// ======================================
// CRUD
// ======================================

// Create Payment
router.post(
  "/",
  protect,
  authorize("admin", "accounting"),
  createPayment
);

// Get All Payments
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getPayments
);

// Get Single Payment
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getPaymentById
);

// Update Payment
router.put(
  "/:id",
  protect,
  authorize("admin", "accounting"),
  updatePayment
);

// Delete Payment
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deletePayment
);

// Refund Payment
router.patch(
  "/refund/:id",
  protect,
  authorize("admin", "accounting"),
  refundPayment
);

// Stripe Payment Intent — any logged-in user may pay (e.g. customer
// portal self-service payment)
router.post(
  "/stripe/create-intent",
  protect,
  createPaymentIntent
);

// Confirm Payment
router.post(
  "/stripe/confirm",
  protect,
  confirmStripePayment
);

// Refund Payment
// Refund Payment
router.post(
  "/stripe/refund",
  protect,
  authorize("admin", "accounting"),
  refundStripePayment
);

// Create Setup Intent — save a customer's card for future
// recurring/commercial auto-pay charges
router.post(
  "/stripe/setup-intent",
  protect,
  authorize("admin", "accounting"),
  createSetupIntent
);

// Confirm Setup Intent — after the card is submitted on the
// frontend, save the resulting payment method on the customer
router.post(
  "/stripe/confirm-setup",
  protect,
  authorize("admin", "accounting"),
  confirmSetupIntent
);

export default router;