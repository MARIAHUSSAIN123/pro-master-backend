import express from "express";
import {
  createChecklistTemplate,
  getChecklistTemplates,
  getChecklistTemplateById,
  updateChecklistTemplate,
  deleteChecklistTemplate,
} from "../controllers/checklistTemplateController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createChecklistTemplate
);

router.get(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  getChecklistTemplates
);

router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  getChecklistTemplateById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateChecklistTemplate
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "manager"),
  deleteChecklistTemplate
);

export default router;
