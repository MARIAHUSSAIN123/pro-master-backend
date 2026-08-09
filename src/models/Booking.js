import mongoose from "mongoose";

const geoPointSchema = new mongoose.Schema(
  { lat: { type: Number }, lng: { type: Number } },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Optional link back to the recurring contract this booking
    // was generated from (Spec 3.3 — "automatically generated from
    // a recurring contract")
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      default: null,
    },

    // Multiple Employees
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    bookingDate: {
      type: Date,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Assigned",
        "In Progress",
        "Completed",
        "Approved",
        "In Dispute",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Spec 3.3 — manager sign-off on a completed job before it's
    // considered final/billable.
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // Spec 3.3 — "Management of issues and complaints reported
    // during a service call." Set when a booking is put in dispute;
    // cleared when it's resolved back to Completed/Approved.
    disputeReason: {
      type: String,
      default: "",
      trim: true,
    },
    disputedAt: {
      type: Date,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

  paymentStatus: {
  type: String,
  enum: [
    "Pending",
    "Partially Paid",
    "Paid",
    "Refunded",
  ],
  default: "Pending",
},

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "E-Transfer",
      ],
      default: "Cash",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Spec 3.3 — "Geolocated check-in/check-out by the agent,
    // submission of a report (text, before-and-after photos,
    // customer signature)"
    checkInLocation: {
      type: geoPointSchema,
      default: null,
    },
    checkInAt: {
      type: Date,
      default: null,
    },
    checkOutLocation: {
      type: geoPointSchema,
      default: null,
    },
    checkOutAt: {
      type: Date,
      default: null,
    },

    serviceReport: {
      type: String,
      default: "",
      trim: true,
    },
    beforePhotos: [
      {
        type: String, // URL
      },
    ],
    afterPhotos: [
      {
        type: String, // URL
      },
    ],
    customerSignature: {
      type: String, // base64 or URL of captured signature
      default: "",
    },
    signedAt: {
      type: Date,
      default: null,
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

export default mongoose.model("Booking", bookingSchema);
