import InventoryItem from "../models/InventoryItem.js";
import StockMovement from "../models/StockMovement.js";
import Employee from "../models/Employee.js";

// ======================================
// Create Inventory Item
// ======================================
export const createItem = async (req, res) => {
  try {
    const {
      itemName,
      itemType,
      sku,
      description,
      unit,
      quantity,
      reorderThreshold,
      location,
      unitCost,
      department,
    } = req.body;

    if (!itemName || !itemType) {
      return res.status(400).json({
        success: false,
        message: "Item name and item type are required.",
      });
    }

    if (sku) {
      const existingSku = await InventoryItem.findOne({ sku });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists.",
        });
      }
    }

    const item = await InventoryItem.create({
      itemName,
      itemType,
      sku,
      description,
      unit,
      quantity: quantity || 0,
      reorderThreshold: reorderThreshold || 0,
      location,
      unitCost,
      department,
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      item,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Inventory Items (with filters)
// ======================================
export const getItems = async (req, res) => {
  try {

    const { itemType, status, lowStock, department } = req.query;

    const filter = {};

    if (itemType) filter.itemType = itemType;
    if (status) filter.status = status;
    if (department) filter.department = department;

    let items = await InventoryItem.find(filter)
      .populate("assignedTo", "fullName designation")
      .populate("department", "departmentName")
      .sort({ createdAt: -1 });

    if (lowStock === "true") {
      items = items.filter(
        (item) => item.quantity <= item.reorderThreshold
      );
    }

    res.status(200).json({
      success: true,
      totalItems: items.length,
      items,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Inventory Item
// ======================================
export const getItemById = async (req, res) => {
  try {

    const item = await InventoryItem.findById(req.params.id)
      .populate("assignedTo", "fullName designation email")
      .populate("department", "departmentName");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    const movements = await StockMovement.find({ item: item._id })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      item,
      recentMovements: movements,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Inventory Item
// ======================================
export const updateItem = async (req, res) => {
  try {

    // Quantity changes must go through stockIn / stockOut so every
    // change is logged in StockMovement — block direct edits here.
    delete req.body.quantity;

    if (req.body.sku) {
      const existingSku = await InventoryItem.findOne({
        sku: req.body.sku,
        _id: { $ne: req.params.id },
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists.",
        });
      }
    }

    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("assignedTo", "fullName designation")
      .populate("department", "departmentName");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully.",
      item,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Inventory Item
// ======================================
export const deleteItem = async (req, res) => {
  try {

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    if (item.status === "Assigned") {
      return res.status(400).json({
        success: false,
        message:
          "Item is currently assigned to a staff member. Unassign it first.",
      });
    }

    await StockMovement.deleteMany({ item: item._id });
    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Stock In (incoming movement)
// ======================================
export const stockIn = async (req, res) => {
  try {

    const { quantity, reason, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    item.quantity += Number(quantity);
    await item.save();

    const movement = await StockMovement.create({
      item: item._id,
      movementType: "IN",
      quantity,
      reason: reason || "Restock",
      quantityAfter: item.quantity,
      performedBy: req.user?._id,
      notes,
    });

    res.status(200).json({
      success: true,
      message: "Stock added successfully.",
      item,
      movement,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Stock Out (outgoing movement)
// ======================================
export const stockOut = async (req, res) => {
  try {

    const { quantity, reason, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available.",
      });
    }

    item.quantity -= Number(quantity);
    await item.save();

    const movement = await StockMovement.create({
      item: item._id,
      movementType: "OUT",
      quantity,
      reason: reason || "Used On Job",
      quantityAfter: item.quantity,
      performedBy: req.user?._id,
      notes,
    });

    res.status(200).json({
      success: true,
      message: "Stock removed successfully.",
      item,
      movement,
      lowStockAlert: item.quantity <= item.reorderThreshold,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Assign Equipment To Employee
// ======================================
export const assignItem = async (req, res) => {
  try {

    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee id is required.",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    if (item.status === "In Maintenance") {
      return res.status(400).json({
        success: false,
        message: "Item is in maintenance and cannot be assigned.",
      });
    }

    item.assignedTo = employeeId;
    item.status = "Assigned";
    await item.save();

    const updated = await InventoryItem.findById(item._id).populate(
      "assignedTo",
      "fullName designation"
    );

    res.status(200).json({
      success: true,
      message: "Item assigned successfully.",
      item: updated,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Unassign Equipment
// ======================================
export const unassignItem = async (req, res) => {
  try {

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    item.assignedTo = null;
    item.status = "Available";
    await item.save();

    res.status(200).json({
      success: true,
      message: "Item unassigned successfully.",
      item,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Log Maintenance (preventive maintenance)
// ======================================
export const logMaintenance = async (req, res) => {
  try {

    const { nextMaintenanceDate, notes, markAsInMaintenance } = req.body;

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    item.lastMaintenanceDate = new Date();

    if (nextMaintenanceDate) {
      item.nextMaintenanceDate = nextMaintenanceDate;
    }

    if (notes) {
      item.notes = notes;
    }

    // If the item is being pulled out of service now, mark it so;
    // otherwise (maintenance already completed) send it back to
    // Available, unless it was actively assigned to someone.
    if (markAsInMaintenance) {
      item.status = "In Maintenance";
    } else if (item.status === "In Maintenance") {
      item.status = item.assignedTo ? "Assigned" : "Available";
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully.",
      item,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Low Stock Items (alerts)
// ======================================
export const getLowStockItems = async (req, res) => {
  try {

    const items = await InventoryItem.find({
      $expr: { $lte: ["$quantity", "$reorderThreshold"] },
    }).populate("department", "departmentName");

    res.status(200).json({
      success: true,
      totalLowStockItems: items.length,
      items,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};