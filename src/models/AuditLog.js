import mongoose from "mongoose";

// Spec 3.1 — User and Role Management
// "Connection history and audit log of sensitive actions."
const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    action: {
      type: String,
      required: true,
      // e.g. LOGIN, USER_CREATED, ROLE_CHANGED, STATUS_CHANGED,
      // PASSWORD_CHANGED, USER_DELETED
    },

    targetType: {
      type: String,
      default: "",
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuditLog", auditLogSchema);
