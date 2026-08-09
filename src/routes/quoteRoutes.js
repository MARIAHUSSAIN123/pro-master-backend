import express from "express";

import {
  createQuote,
  getQuotes,
  getQuoteById,
  getMyQuotes,
  updateQuote,
  deleteQuote,
  sendQuote,
  respondToQuote,
  saveQuoteToCart,
  getMyCart,
  createCheckoutSession,
  confirmCheckoutSession,
  convertQuote,
  getQuoteStatistics,
} from "../controllers/quoteController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Customer Portal (Spec 3.2)
// ======================================
router.get("/me", protect, authorize("customer"), getMyQuotes);
router.get("/me/cart", protect, authorize("customer"), getMyCart);
router.patch(
  "/:id/respond",
  protect,
  authorize("customer"),
  respondToQuote
);
router.patch(
  "/:id/save",
  protect,
  authorize("customer"),
  saveQuoteToCart
);
router.post(
  "/:id/checkout",
  protect,
  authorize("customer"),
  createCheckoutSession
);
router.post(
  "/:id/checkout/confirm",
  protect,
  authorize("customer"),
  confirmCheckoutSession
);

// ======================================
// Dashboard
// ======================================
router.get(
  "/statistics",
  protect,
  authorize("admin", "manager", "accounting"),
  getQuoteStatistics
);

// ======================================
// CRUD
// ======================================
router.post(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  createQuote
);

router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getQuotes
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getQuoteById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  updateQuote
);

router.delete("/:id", protect, authorize("admin"), deleteQuote);

// ======================================
// Lifecycle
// ======================================
router.patch(
  "/:id/send",
  protect,
  authorize("admin", "manager", "accounting"),
  sendQuote
);

router.patch(
  "/:id/convert",
  protect,
  authorize("admin", "manager", "accounting"),
  convertQuote
);

export default router;