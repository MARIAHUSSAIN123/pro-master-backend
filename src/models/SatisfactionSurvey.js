import mongoose from "mongoose";

// Spec 3.7 — "Post-service customer satisfaction surveys"
const satisfactionSurveySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // one survey per booking
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    comments: {
      type: String,
      default: "",
      trim: true,
    },

    wouldRecommend: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SatisfactionSurvey", satisfactionSurveySchema);
