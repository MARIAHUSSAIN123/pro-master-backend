import express from "express";
import {
  getAuditLogs,
  getUserLoginHistory,
} from "../controllers/auditLogController.js";
import { protect, authorize, selfOrRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Full audit log — admin only
router.get(
  "/",
  protect,
  authorize("admin"),
  getAuditLogs
);

// A single user's login/connection history — that user or an admin
router.get(
  "/login-history/:id",
  protect,
  selfOrRoles("admin"),
  getUserLoginHistory
);

export default router;
