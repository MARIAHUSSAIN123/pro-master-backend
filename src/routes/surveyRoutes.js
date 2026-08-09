import express from "express";
import {
  submitMySurvey,
  getSurveys,
  getSurveyById,
  getSurveyStats,
} from "../controllers/surveyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer portal — submit satisfaction survey for own booking
router.post("/me", protect, authorize("customer"), submitMySurvey);

router.get(
  "/stats",
  protect,
  authorize("admin", "manager"),
  getSurveyStats
);

router.get("/", protect, authorize("admin", "manager"), getSurveys);

router.get("/:id", protect, authorize("admin", "manager"), getSurveyById);

export default router;
