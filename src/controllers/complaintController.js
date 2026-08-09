import Complaint from "../models/Complaint.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

// ======================================
// Create Complaint / Non-Conformity
// ======================================
export const createComplaint = async (req, res) => {
  try {
    const { booking, type, description, severity } = req.body;

    if (!booking || !description) {
      return res.status(400).json({
        success: false,
        message: "Booking and description are required.",
      });
    }

    const bookingExists = await Booking.findById(booking);
    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const complaint = await Complaint.create({
      booking,
      customer: bookingExists.customer,
      reportedBy: req.user._id,
      type,
      description,
      severity,
    });

    // Spec 3.3 — a serious complaint should move the booking into the
    // "in dispute" lifecycle state rather than sitting silently as
    // Completed/Approved while the issue is unresolved.
    if (["High", "Critical"].includes(severity) && bookingExists.status !== "Cancelled") {
      bookingExists.status = "In Dispute";
      bookingExists.disputedAt = new Date();
      bookingExists.disputeReason = description;
      await bookingExists.save();
    }

    res.status(201).json({
      success: true,
      message: "Complaint recorded successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Complaints
// ======================================
export const getComplaints = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.severity) query.severity = req.query.severity;

    const complaints = await Complaint.find(query)
      .populate("customer", "fullName email")
      .populate("booking", "bookingNumber bookingDate")
      .populate("reportedBy", "fullName role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalComplaints: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Complaint
// ======================================
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("customer", "fullName email phone")
      .populate("booking")
      .populate("reportedBy", "fullName role");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // A customer may only view their own complaints
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ user: req.user._id });
      if (
        !customer ||
        complaint.customer._id.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access Denied",
        });
      }
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Complaint (status, corrective action)
// ======================================
export const updateComplaint = async (req, res) => {
  try {
    const { status, severity, correctiveAction } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (status) complaint.status = status;
    if (severity) complaint.severity = severity;
    if (correctiveAction !== undefined)
      complaint.correctiveAction = correctiveAction;

    if (status === "Resolved" || status === "Closed") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — Submit a complaint about own booking
// ======================================
export const createMyComplaint = async (req, res) => {
  try {
    const { booking, description, severity } = req.body;

    if (!booking || !description) {
      return res.status(400).json({
        success: false,
        message: "Booking and description are required.",
      });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const bookingExists = await Booking.findOne({
      _id: booking,
      customer: customer._id,
    });

    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this customer.",
      });
    }

    const complaint = await Complaint.create({
      booking,
      customer: customer._id,
      reportedBy: req.user._id,
      type: "Complaint",
      description,
      severity,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
