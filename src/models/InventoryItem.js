import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    itemType: {
      type: String,
      enum: [
        "Cleaning Supply",
        "Machinery",
        "Vehicle",
        "PPE",
        "Tool",
        "Other",
      ],
      required: true,
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },

    // Current stock level. For serialized single assets (a vehicle, a
    // specific machine) this stays at 1 and the item is tracked via
    // assignedTo instead of quantity.
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Below this level the item should trigger a low-stock alert.
    reorderThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Where the stock physically sits — a warehouse name or a
    // vehicle/team identifier.
    location: {
      type: String,
      default: "Main Warehouse",
      trim: true,
    },

    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Only meaningful for serialized equipment (machinery, vehicles,
    // tools) that gets handed to a specific staff member or team.
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // Preventive maintenance tracking for machinery/vehicles.
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },

    nextMaintenanceDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Assigned",
        "In Maintenance",
        "Retired",
      ],
      default: "Available",
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

export default mongoose.model("InventoryItem", inventoryItemSchema);