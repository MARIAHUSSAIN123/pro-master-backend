import express from "express";
import {
  sendMessage,
  sendAnnouncement,
  getInbox,
  getSentMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Internal messaging is for staff (admin/manager/employee/accounting) —
// customers are not part of the internal announcements/messaging loop
router.post(
  "/",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  sendMessage
);

router.post(
  "/announcement",
  protect,
  authorize("admin", "manager"),
  sendAnnouncement
);

router.get(
  "/inbox",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  getInbox
);

router.get(
  "/sent",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  getSentMessages
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  getMessageById
);

router.put(
  "/:id/read",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  markMessageAsRead
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "manager", "employee", "accounting"),
  deleteMessage
);

export default router;