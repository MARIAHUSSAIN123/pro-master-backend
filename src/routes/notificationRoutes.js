import express from "express";
import {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotification,
} from "../controllers/notificationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user (admin, manager, employee, accounting, customer)
router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllAsRead);
router.get("/:id", protect, getNotificationById);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

// Admin/Manager — manually trigger notifications
router.post("/", protect, authorize("admin", "manager"), createNotification);
router.post(
  "/bulk",
  protect,
  authorize("admin", "manager"),
  createBulkNotification
);

export default router;