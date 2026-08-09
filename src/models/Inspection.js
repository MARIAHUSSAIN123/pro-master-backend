import mongoose from "mongoose";

// Spec 3.7 — Quality, Inspection, and Complaints
// A snapshot of a checklist filled in for a specific booking/service call.
const inspectionItemSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    passed: {
      type: Boolean,
      default: null, // null = not yet evaluated
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    checklistTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChecklistTemplate",
      required: true,
    },

    // Items copied in from the template at inspection time, then
    // filled in — keeps history intact even if the template changes later.
    items: {
      type: [inspectionItemSchema],
      required: true,
    },

    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },

    // % of required items marked passed
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    inspectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Inspection", inspectionSchema);
