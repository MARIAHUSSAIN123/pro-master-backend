import mongoose from "mongoose";

// Spec 3.7 — Quality, Inspection, and Complaints
// "Quality control checklists by service type"
const checklistItemSchema = new mongoose.Schema(
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
  },
  { _id: true }
);

const checklistTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // A checklist is defined per service type. Leave null for a
    // general checklist that can be reused across service types.
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    items: {
      type: [checklistItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "A checklist must contain at least one item.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model("ChecklistTemplate", checklistTemplateSchema);
