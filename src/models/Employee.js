import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // Links this staff profile to their login account so the mobile
    // app can tie check-in/check-out and attendance to the actual
    // logged-in agent (Spec 3.3 — "Geolocated check-in/check-out by
    // the agent").
    //
    // No `default` here on purpose — see the identical note on
    // Customer.user in models/Customer.js: a sparse unique index only
    // excludes documents where the field is truly absent, not ones
    // explicitly set to null.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      enum: [
        "Cleaner",
        "Supervisor",
        "Driver",
        "Office Staff",
        "Manager",
      ],
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    salary: {
      type: Number,
      required: true,
      min: 0,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Spec 3.4 — used by the smart assignment engine to score
    // candidates by geographic proximity to the booking (single
    // service-area assumption, so city-level matching is enough).
    city: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyContact: {
      type: String,
      default: "",
      trim: true,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    profileImage: {
      type: String,
      default: "",
    },

    employmentType: {
      type: String,
      enum: [
        "Full Time",
        "Part Time",
        "Contract",
      ],
      default: "Full Time",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "On Leave",
      ],
      default: "Active",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employee", employeeSchema);