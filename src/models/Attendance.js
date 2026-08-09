import mongoose from "mongoose";

// Spec 3.3 — "Geolocated check-in/check-out by the agent"
const geoPointSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Leave",
        "Half Day",
        "Late",
      ],
      default: "Present",
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkInLocation: {
      type: geoPointSchema,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    checkOutLocation: {
      type: geoPointSchema,
      default: null,
    },

    hoursWorked: {
      type: Number,
      default: 0,
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Attendance", attendanceSchema);
