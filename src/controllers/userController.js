import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { logAction } from "../utils/auditLogger.js";

// ======================================
// Get All Users
// ======================================
export const getUsers = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    const query = {};

    if (search) {
      query.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === "true";
    }

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single User
// ======================================
export const getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Update User
// ======================================
export const updateUser = async (req, res) => {
  try {

    const {
      fullName,
      email,
      phone,
      role,
      profileImage,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check Duplicate Email
    if (email && email !== user.email) {

      const emailExists = await User.findOne({
        email,
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    user.fullName =
      fullName || user.fullName;

    user.email =
      email || user.email;

    user.phone =
      phone || user.phone;

    // Role changes go through changeUserRole so they're consistently
    // audit-logged — ignore role edits made through the generic update.
    user.profileImage =
      profileImage || user.profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        isActive: updatedUser.isActive,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Change Password
// (Route: selfOrRoles("admin") — user can change their own, admin can change any)
// ======================================
export const changePassword = async (req, res) => {
  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Admins acting on someone else's account can skip the current
    // password check; users changing their own must confirm it.
    const isSelf = req.user._id.toString() === req.params.id;

    if (isSelf) {
      const isMatch = await bcrypt.compare(
        currentPassword || "",
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    await logAction({
      user: req.user._id,
      action: "PASSWORD_CHANGED",
      targetType: "User",
      targetId: user._id,
      details: { changedBySelf: isSelf },
      req,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Profile Image
// (Route: selfOrRoles("admin") — user can update their own, admin can update any)
// ======================================
export const updateProfileImage = async (req, res) => {
  try {

    const { profileImage } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      profileImage: user.profileImage,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Activate / Deactivate User
// ======================================
export const updateUserStatus = async (req, res) => {
  try {

    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deactivating the last admin
    if (user.role === "admin" && isActive === false) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the last active admin.",
        });
      }
    }

    user.isActive = isActive;

    await user.save();

    await logAction({
      user: req.user._id,
      action: "STATUS_CHANGED",
      targetType: "User",
      targetId: user._id,
      details: { isActive },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User ${
        isActive ? "activated" : "deactivated"
      } successfully.`,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Change User Role
// ======================================
export const changeUserRole = async (req, res) => {
  try {

    const { role } = req.body;

    const allowedRoles = [
      "admin",
      "manager",
      "employee",
      "accounting",
      "customer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent removing the last admin's admin role
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change role of the last admin.",
        });
      }
    }

    const previousRole = user.role;
    user.role = role;

    await user.save();

    await logAction({
      user: req.user._id,
      action: "ROLE_CHANGED",
      targetType: "User",
      targetId: user._id,
      details: { from: previousRole, to: role },
      req,
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete User
// ======================================
export const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {

      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user.",
        });
      }
    }

    const deletedInfo = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    await user.deleteOne();

    await logAction({
      user: req.user._id,
      action: "USER_DELETED",
      targetType: "User",
      targetId: req.params.id,
      details: deletedInfo,
      req,
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
