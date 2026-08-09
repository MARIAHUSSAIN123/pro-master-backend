import express from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  updateProfileImage,
  updateUserStatus,
  changeUserRole,
  deleteUser,
} from "../controllers/userController.js";

import {
  protect,
  authorize,
  selfOrRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// User Management
// ======================================

// Get All Users
router.get(
  "/",
  protect,
  authorize("admin"),
  getUsers
);

// Get Single User
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);

// Update User
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateUser
);

// Change Password
// Fix: was `protect` only — any logged-in user could target another
// user's id. Now restricted to the user themselves or an admin.
router.put(
  "/change-password/:id",
  protect,
  selfOrRoles("admin"),
  changePassword
);

// Update Profile Image
// Fix: was `protect` only — same IDOR issue as change-password.
router.put(
  "/profile-image/:id",
  protect,
  selfOrRoles("admin"),
  updateProfileImage
);

// Activate / Deactivate User
router.patch(
  "/status/:id",
  protect,
  authorize("admin"),
  updateUserStatus
);

// Change User Role
router.patch(
  "/role/:id",
  protect,
  authorize("admin"),
  changeUserRole
);

// Delete User
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);

export default router;
