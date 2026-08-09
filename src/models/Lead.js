import mongoose from "mongoose";

// Public "Get a Free Quote" / contact form submissions from the
// marketing website. Not the same as a Quote (Spec 3.5) — a Lead has
// no pricing yet; a staff member reviews it, optionally creates a
// Customer record, and then builds a real Quote from the catalog.
const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    customerType: {
      type: String,
      enum: ["Residential", "Commercial"],
      default: "Residential",
    },

    // Free-text service interest from the form (e.g. "Office cleaning",
    // "Recurring janitorial"). Not linked to the Service catalog because
    // an anonymous visitor may not map cleanly to one catalog item.
    serviceInterest: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Rejected"],
      default: "New",
    },

    // Set once staff creates a Customer record from this lead.
    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    // Internal staff notes (follow-up calls, reason for rejection, etc.)
    internalNotes: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      default: "Website",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);