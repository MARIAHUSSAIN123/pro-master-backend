import express from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  convertLeadToCustomer,
  deleteLead,
} from "../controllers/leadController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Public Route (Marketing Website — "Get a Free Quote" form)
// ======================================
router.post("/", createLead);

// ======================================
// Staff Routes
// ======================================
router.get("/", protect, authorize("admin", "manager"), getLeads);
router.get("/:id", protect, authorize("admin", "manager"), getLeadById);
router.put("/:id", protect, authorize("admin", "manager"), updateLead);
router.post(
  "/:id/convert",
  protect,
  authorize("admin", "manager"),
  convertLeadToCustomer
);
router.delete("/:id", protect, authorize("admin"), deleteLead);

export default router;