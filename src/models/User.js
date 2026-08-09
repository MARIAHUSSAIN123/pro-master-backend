import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Spec 3.1 — "Secure authentication (email/password, SSO option)".
    // Present only for accounts created/linked via Google Sign-In;
    // such accounts still get a random unusable password hash so the
    // schema stays simple (see authController.googleLogin).
  

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "admin",
        "manager",
        "employee",
        "accounting",
        "customer",
      ],
      default: "customer",
    },

    profileImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
// ek baar terminal mein node script se chala lo, ya server start hote waqt temporarily
