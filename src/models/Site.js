import mongoose from "mongoose";

// Spec 3.2 — "Multi-site management per client (service addresses,
// access, special instructions)"
const siteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    siteName: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Main Office", "Warehouse 2", "Downtown Branch"
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    // Gate codes, key location, on-site contact person, parking, etc.
    accessInstructions: {
      type: String,
      default: "",
      trim: true,
    },

    // Anything the assigned agent should know before arriving
    specialInstructions: {
      type: String,
      default: "",
      trim: true,
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

export default mongoose.model("Site", siteSchema);
