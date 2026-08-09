import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import generateToken from "../utils/generateToken.js";
import { logAction } from "../utils/auditLogger.js";
import { verifyGoogleIdToken } from "../utils/googleSSO.js";

// ======================================
// Register User
// (Route already restricted to admin — see authRoutes.js)
// ======================================
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
    } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const allowedRoles = [
      "admin",
      "manager",
      "employee",
      "accounting",
      "customer",
    ];

    const userRole = allowedRoles.includes(role)
      ? role
      : "customer";

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: userRole,
    });

    const token = generateToken(
      user._id,
      user.role
    );

    // Spec 3.1 — audit log of sensitive actions
    await logAction({
      user: req.user?._id,
      action: "USER_CREATED",
      targetType: "User",
      targetId: user._id,
      details: { createdRole: user.role, createdEmail: user.email },
      req,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
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
// Register Customer (PUBLIC self-signup — website "Sign Up" for
// residential / one-time-service customers, so they can book instantly
// without waiting on a staff-created account. Commercial/contract
// customers still go through the Lead -> staff-reviewed flow.)
// ======================================
export const registerCustomer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      address,
      city,
      province,
      postalCode,
    } = req.body;

    if (!fullName || !email || !password || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, phone, address and city are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "A customer profile already exists for this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the login account and the customer profile together so
    // POST /api/bookings/me works immediately after signup.
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "customer",
    });

    let customer;
    try {
      customer = await Customer.create({
        user: user._id,
        fullName,
        email: normalizedEmail,
        phone,
        address,
        city,
        province,
        postalCode,
        customerType: "Residential",
      });
    } catch (err) {
      // Roll back the auth account if the profile creation fails, so
      // we never leave a "loginable" user with no customer profile.
      await User.findByIdAndDelete(user._id);
      throw err;
    }

    const token = generateToken(user._id, user.role);

    await logAction({
      user: user._id,
      action: "CUSTOMER_SELF_REGISTERED",
      targetType: "User",
      targetId: user._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Login
// ======================================
export const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      // Spec 3.1 — connection history / audit log
      await logAction({
        user: user._id,
        action: "LOGIN_FAILED",
        targetType: "User",
        targetId: user._id,
        req,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(
      user._id,
      user.role
    );

    // Spec 3.1 — "Connection history"
    await logAction({
      user: user._id,
      action: "LOGIN",
      targetType: "User",
      targetId: user._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
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
// Get Logged In User
// ======================================
// ======================================
// SSO Login — Google
// (Spec 3.1 — "Secure authentication (email/password, SSO option)")
//
// Client (web back office or customer portal) runs Google Sign-In
// and sends us the resulting id_token. We verify it ourselves
// (utils/googleSSO.js) rather than trusting the client's claim about
// who signed in.
// ======================================
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required.",
      });
    }

    let googleUser;
    try {
      googleUser = await verifyGoogleIdToken(idToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: `Google sign-in failed: ${err.message}`,
      });
    }

    if (!googleUser.emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Google account email is not verified.",
      });
    }

    let user = await User.findOne({
      $or: [{ googleId: googleUser.sub }, { email: googleUser.email }],
    });

    if (user) {
      // Link the Google account to an existing email/password user
      // the first time they use SSO.
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
    } else {
      // New account via SSO — customers are the only role that can
      // self-provision this way; staff accounts are still created by
      // an admin via /register.
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        password: hashedPassword,
        googleId: googleUser.sub,
        role: "customer",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    const token = generateToken(user._id, user.role);

    // Spec 3.1 — "Connection history"
    await logAction({
      user: user._id,
      action: "LOGIN_SSO_GOOGLE",
      targetType: "User",
      targetId: user._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
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
// Get Logged-in User Profile
// ======================================
export const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select(
      "-password"
    );

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
// Update Logged-in User Profile
// (name / phone / profile image only — email & role are not
// self-editable here for security/audit reasons)
// ======================================
export const updateProfile = async (req, res) => {
  try {

    const { fullName, phone, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    await logAction({
      user: user._id,
      action: "PROFILE_UPDATED",
      targetType: "User",
      targetId: user._id,
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: safeUser,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Change Password (self-service, requires current password)
// ======================================
export const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logAction({
      user: user._id,
      action: "PASSWORD_CHANGED",
      targetType: "User",
      targetId: user._id,
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
