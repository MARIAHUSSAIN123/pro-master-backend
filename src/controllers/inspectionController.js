import Inspection from "../models/Inspection.js";
import ChecklistTemplate from "../models/ChecklistTemplate.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

// Recompute status + score from an items array
const scoreItems = (items) => {
  const requiredItems = items.filter((i) => i.required);
  const evaluated = requiredItems.filter((i) => i.passed !== null);
  const passedCount = requiredItems.filter((i) => i.passed === true).length;

  const score =
    requiredItems.length > 0
      ? Math.round((passedCount / requiredItems.length) * 100)
      : 100;

  let status = "Pending";
  if (evaluated.length === requiredItems.length && requiredItems.length > 0) {
    status = passedCount === requiredItems.length ? "Pass" : "Fail";
  }

  return { score, status };
};

// ======================================
// Create Inspection (start a checklist against a booking)
// ======================================
export const createInspection = async (req, res) => {
  try {
    const { booking, checklistTemplate } = req.body;

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking is required.",
      });
    }

    const bookingExists = await Booking.findById(booking);
    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Use the given template, or auto-select an active one matching the
    // booking's service (spec: "checklists by service type").
    let template = null;
    if (checklistTemplate) {
      template = await ChecklistTemplate.findById(checklistTemplate);
    } else {
      template = await ChecklistTemplate.findOne({
        service: bookingExists.service,
        isActive: true,
      });
      if (!template) {
        template = await ChecklistTemplate.findOne({
          service: null,
          isActive: true,
        });
      }
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "No active checklist template found for this service.",
      });
    }

    const existing = await Inspection.findOne({
      booking,
      checklistTemplate: template._id,
      status: "Pending",
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A pending inspection already exists for this booking.",
      });
    }

    const items = template.items.map((item) => ({
      label: item.label,
      required: item.required,
      passed: null,
      notes: "",
    }));

    const inspection = await Inspection.create({
      booking,
      service: bookingExists.service,
      checklistTemplate: template._id,
      items,
      inspectedBy: req.user._id,
      status: "Pending",
      score: 0,
    });

    res.status(201).json({
      success: true,
      message: "Inspection started successfully.",
      inspection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Inspections
// ======================================
export const getInspections = async (req, res) => {
  try {
    const query = {};
    if (req.query.booking) query.booking = req.query.booking;
    if (req.query.status) query.status = req.query.status;
    if (req.query.service) query.service = req.query.service;

    const inspections = await Inspection.find(query)
      .populate("booking", "bookingNumber bookingDate")
      .populate("service", "serviceName category")
      .populate("checklistTemplate", "name")
      .populate("inspectedBy", "fullName role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalInspections: inspections.length,
      inspections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Inspection
// ======================================
export const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate("booking")
      .populate("service", "serviceName category")
      .populate("checklistTemplate", "name")
      .populate("inspectedBy", "fullName role");

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found.",
      });
    }

    res.status(200).json({
      success: true,
      inspection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Inspection (fill in / edit item results)
// ======================================
export const updateInspection = async (req, res) => {
  try {
    const { items, notes } = req.body;

    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found.",
      });
    }

    if (items && Array.isArray(items)) {
      // Merge by label so the client can send only changed items,
      // or the full array — both work.
      items.forEach((update) => {
        const target = inspection.items.find((i) => i.label === update.label);
        if (target) {
          if (update.passed !== undefined) target.passed = update.passed;
          if (update.notes !== undefined) target.notes = update.notes;
        }
      });
    }

    if (notes !== undefined) inspection.notes = notes;

    const { score, status } = scoreItems(inspection.items);
    inspection.score = score;
    inspection.status = status;
    if (status !== "Pending") inspection.inspectedAt = new Date();

    await inspection.save();

    res.status(200).json({
      success: true,
      message: "Inspection updated successfully.",
      inspection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — view inspection results for own booking
// ======================================
export const getMyInspections = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const bookings = await Booking.find({ customer: customer._id }).select(
      "_id"
    );
    const bookingIds = bookings.map((b) => b._id);

    const inspections = await Inspection.find({
      booking: { $in: bookingIds },
      status: { $ne: "Pending" },
    })
      .populate("booking", "bookingNumber bookingDate")
      .populate("service", "serviceName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalInspections: inspections.length,
      inspections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
