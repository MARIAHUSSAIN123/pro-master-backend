import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  createMyComplaint,
} from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer portal — submit complaint about own booking
router.post("/me", protect, authorize("customer"), createMyComplaint);

// Staff — record a complaint/non-conformity
router.post(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  createComplaint
);

router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  getComplaints
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "customer"),
  getComplaintById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateComplaint
);

export default router;
