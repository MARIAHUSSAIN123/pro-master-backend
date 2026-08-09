import mongoose from "mongoose";

// Spec 3.8 — Notifications and Communication
// "Simple internal messaging between managers and agents
// (announcements, instructions)"
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who the message is for. "Direct" = one-to-one (recipient set).
    // "Role" / "Department" / "All" = broadcast-style announcement.
    audience: {
      type: String,
      enum: ["Direct", "Role", "Department", "All"],
      default: "Direct",
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // required when audience === "Direct"
    },

    role: {
      type: String,
      enum: [
        "admin",
        "manager",
        "employee",
        "accounting",
        "customer",
        null,
      ],
      default: null, // required when audience === "Role"
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null, // required when audience === "Department"
    },

    isAnnouncement: {
      type: Boolean,
      default: false,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    attachments: [
      {
        type: String, // file URL
      },
    ],

    // Read tracking works for both direct messages and broadcasts —
    // for a direct message this array will only ever hold the one
    // recipient once they open it.
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ audience: 1, role: 1, department: 1 });

export default mongoose.model("Message", messageSchema);