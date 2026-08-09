import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },

    movementType: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      enum: [
        "Purchase",
        "Restock",
        "Used On Job",
        "Damaged",
        "Lost",
        "Transfer",
        "Adjustment",
        "Other",
      ],
      default: "Other",
    },

    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

export default mongoose.model("StockMovement", stockMovementSchema);