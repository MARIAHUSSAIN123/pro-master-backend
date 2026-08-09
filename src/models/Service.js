import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      enum: [
        "Residential",
        "Commercial",
        "Deep Cleaning",
        "Carpet Cleaning",
        "Window Cleaning",
        "Move In / Move Out",
        "Post Construction",
      ],
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    employeesRequired: {
      type: Number,
      default: 1,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Service", serviceSchema);