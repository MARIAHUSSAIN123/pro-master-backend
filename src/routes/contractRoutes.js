import express from "express";
import {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  cancelContract,
  runRecurringBillingNow,
} from "../controllers/contractController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Must stay above "/:id" — it's a static path, not a contract id.
router.post(
  "/run-billing-now",
  protect,
  authorize("admin"),
  runRecurringBillingNow
);

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createContract
);
router.get(
  "/",
  protect,
  authorize("admin", "manager", "accounting"),
  getContracts
);
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "accounting"),
  getContractById
);
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateContract
);
router.patch(
  "/:id/cancel",
  protect,
  authorize("admin", "manager"),
  cancelContract
);

export default router;
