import mongoose from "mongoose";

// Spec 3.2 — "Management of recurring contracts (frequency, included
// services, rates, duration)"
const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    frequency: {
      type: String,
      enum: [
        "Daily",
        "Weekly",
        "Bi-Weekly",
        "Monthly",
        "Quarterly",
        "One-Time",
      ],
      required: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    billingCycle: {
      type: String,
      enum: ["Weekly", "Monthly", "Quarterly", "Annually"],
      default: "Monthly",
    },

    startDate: {
      type: Date,
      required: true,
    },

    // null = ongoing / no fixed end
    endDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Paused", "Cancelled", "Expired"],
      default: "Active",
    },

    // Spec 3.5 — "automated recurring billing (schedule)". Driven by
    // services/recurringBillingScheduler.js — nextBillingDate is when
    // the next Booking + Invoice should auto-generate; lastBilledAt
    // records the last time this contract was actually billed so the
    // scheduler never double-bills the same cycle.
    nextBillingDate: {
      type: Date,
      default: null,
    },
    lastBilledAt: {
      type: Date,
      default: null,
    },
    // Spec (Decision 2, Option B) — when true, the scheduler charges
    // the customer's saved Stripe card automatically each billing
    // cycle instead of just generating an invoice for manual payment.
    autoPayEnabled: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contract", contractSchema);
