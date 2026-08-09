import express from "express";
import {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  getMyInspections,
} from "../controllers/inspectionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer Portal — view inspections tied to my own bookings
router.get("/me", protect, authorize("customer"), getMyInspections);

router.post(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  createInspection
);

router.get(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  getInspections
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  getInspectionById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  updateInspection
);

export default router;
