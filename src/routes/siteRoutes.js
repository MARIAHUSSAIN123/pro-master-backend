import express from "express";
import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite,
} from "../controllers/siteController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin", "manager"), createSite);
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getSites
);
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getSiteById
);
router.put("/:id", protect, authorize("admin", "manager"), updateSite);
router.delete("/:id", protect, authorize("admin"), deleteSite);

export default router;
