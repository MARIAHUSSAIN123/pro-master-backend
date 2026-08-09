import mongoose from "mongoose";

// Spec 3.5 — "Generating quotes based on a catalog of services and
// pricing schedules" + "Converting a quote to a contract or
// purchase order."
const quoteItemSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Snapshot of the service name/price at the time the quote was
    // created, so the quote stays accurate even if the service
    // catalog price changes later.
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
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
      default: null,
    },

    items: {
      type: [quoteItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "A quote must include at least one service item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Whether this quote, once accepted, becomes a one-time
    // purchase order (-> Booking) or a recurring agreement
    // (-> Contract). Mirrors Contract.frequency for the recurring
    // case (Spec 3.5 — "Converting a quote to a contract or
    // purchase order").
    intendedUse: {
      type: String,
      enum: ["OneTime", "RecurringContract"],
      default: "OneTime",
    },

    // Only relevant when intendedUse === "RecurringContract"
    recurringFrequency: {
      type: String,
      enum: [
        "Daily",
        "Weekly",
        "Bi-Weekly",
        "Monthly",
        "Quarterly",
        "One-Time",
      ],
      default: undefined,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Accepted",
        "Rejected",
        "Expired",
        "Saved",
        "Converted",
      ],
      default: "Draft",
    },

    // Set when the customer clicks "Save" instead of paying right
    // away (client requirement: quote sits in the customer's cart,
    // with a red badge reminder, until they come back to pay or the
    // 24h reminder nudges them).
    savedAt: {
      type: Date,
      default: null,
    },

    // Tracks whether the 24h "come back and pay" reminder has already
    // gone out for the current Saved state, so it's sent exactly once
    // per save (reset to null if the customer saves it again later).
    reminderSentAt: {
      type: Date,
      default: null,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    // Set once the quote has been turned into Booking(s) or a
    // Contract. A one-time quote can hold several service line
    // items, so it may convert into one Booking per item.
    convertedBookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],

    convertedToContract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      default: null,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // Reason given if the customer rejects the quote
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quote", quoteSchema);