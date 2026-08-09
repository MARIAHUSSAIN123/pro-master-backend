import mongoose from "mongoose";

// Spec 3.8 — Notifications and Communication
// "Push notifications, email, and text messages: appointment confirmation,
// reminders, schedule changes, and invoice notifications"
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "BookingConfirmation",
        "BookingReminder",
        "ScheduleChange",
        "InvoiceCreated",
        "PaymentReminder",
        "QuoteSaved",
        "Message",
        "Announcement",
        "General",
      ],
      default: "General",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    // Delivery channel(s) this notification should go out on.
    channels: {
      type: [String],
      enum: ["InApp", "Email", "SMS", "Push"],
      default: ["InApp"],
    },

    // Generic polymorphic link back to the record that triggered the
    // notification (a Booking, Invoice, Message, etc.) so the client
    // can deep-link into it.
    relatedModel: {
      type: String,
      enum: [
        "Booking",
        "Invoice",
        "Contract",
        "Quote",
        "Complaint",
        "Message",
        "User",
        null,
      ],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // Delivery status for the non-InApp channels (Email/SMS/Push).
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed"],
      default: "Pending",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);