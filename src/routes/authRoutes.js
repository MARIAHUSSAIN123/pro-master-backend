import express from "express";

import {
  register,
  registerCustomer,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================
// Public Routes
// ======================================

// Login
router.post("/login", login);

// SSO Login — Google (Spec 3.1 — "SSO option")
router.post("/google", googleLogin);

// Customer self-signup (Spec 3.2 — Customer Portal)
// Public — residential/one-time customers create their own login account.
router.post("/register-customer", registerCustomer);

// Register
// Sirf admin hi naye users create karega
router.post(
  "/register",
  protect,
  authorize("admin"),
  register
);


// ======================================
// Private Routes
// ======================================

// Logged In User
router.get(
  "/profile",
  protect,
  getProfile
);

// Update Own Profile
router.put(
  "/profile",
  protect,
  updateProfile
);

// Change Own Password
router.put(
  "/change-password",
  protect,
  changePassword
);

export default router;