import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Service from "../models/Service.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { sendBulkNotification } from "../utils/sendNotification.js";
import {
  suggestAgentsForBooking,
  getStaffingAlerts,
} from "../services/assignmentEngine.js";


// ======================================
// Create Booking (staff)
// ======================================
export const createBooking = async (req, res) => {
  try {
    const {
      customer,
      service,
      bookingDate,
      bookingTime,
      address,
      paymentMethod,
      notes,
    } = req.body;

    if (
      !customer ||
      !service ||
      !bookingDate ||
      !bookingTime ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }
    if (address.trim().length < 10) {
  return res.status(400).json({
    success: false,
    message: "Please enter a complete service address.",
  });
}
const today = new Date();

today.setHours(0, 0, 0, 0);

if (new Date(bookingDate) < today) {
  return res.status(400).json({
    success: false,
    message: "Booking date cannot be in the past.",
  });
}

    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const serviceExists = await Service.findById(service);

    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    if (serviceExists.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This service is inactive.",
      });
    }
// ======================================
// Prevent Duplicate Booking
// ======================================

const existingBooking = await Booking.findOne({
  customer,
  bookingDate: new Date(bookingDate),
  bookingTime,
  status: {
    $nin: ["Cancelled"],
  },
});

if (existingBooking) {
  return res.status(400).json({
    success: false,
    message:
      "This customer already has a booking at the selected date and time.",
  });
}
   const bookingNumber =
  `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const booking = await Booking.create({
      bookingNumber,
      customer,
      service,
      bookingDate,
      bookingTime,
      address,
      totalAmount: serviceExists.price,
      paymentMethod,
      notes,
      createdBy: req.user?.id,
    });
    try {

  await sendEmail(
    customerExists.email,
    "Booking Confirmation",
    `
      <h2>Booking Confirmed</h2>

      <p>Hello ${customerExists.fullName},</p>

      <p>Your booking has been created successfully.</p>

      <p><strong>Date:</strong> ${booking.bookingDate.toDateString()}</p>

      <p><strong>Time:</strong> ${booking.bookingTime}</p>

      <p>Thank you for choosing Pro Master Cleaning.</p>
    `
  );

} catch (error) {

  console.log("Email Error:", error.message);

}

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees");

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: populatedBooking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Customer Portal — Request a service
// (Spec 3.2 — "Customer Portal: ... request services")
// ======================================
export const createMyBooking = async (req, res) => {
  try {
    const { service, bookingDate, bookingTime, address, paymentMethod, notes } =
      req.body;

    if (!service || !bookingDate || !bookingTime || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const customerExists = await Customer.findOne({ user: req.user._id });
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const serviceExists = await Service.findById(service);
    if (!serviceExists || serviceExists.status !== "Active") {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(bookingDate) < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past.",
      });
    }

    const bookingNumber = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const booking = await Booking.create({
      bookingNumber,
      customer: customerExists._id,
      service,
      bookingDate,
      bookingTime,
      address,
      totalAmount: serviceExists.price,
      paymentMethod,
      notes,
      createdBy: req.user._id,
    });

    // Let staff know a customer just requested a service directly —
    // previously nothing surfaced this anywhere except manually
    // checking the admin Bookings page. In-app bell + email to every
    // admin/manager so it's seen right away.
    const staffToNotify = await User.find({
      role: { $in: ["admin", "manager"] },
    }).select("_id");

    await sendBulkNotification({
      recipients: staffToNotify.map((u) => u._id),
      type: "General",
      title: "New service request",
      body: `${customerExists.fullName} requested ${serviceExists.name} for ${new Date(
        bookingDate
      ).toLocaleDateString()}. Booking ${bookingNumber}.`,
      channels: ["InApp", "Email"],
      relatedModel: "Booking",
      relatedId: booking._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Service requested successfully.",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — View my service calls
// ======================================
export const getMyBookings = async (req, res) => {
  try {
    const customerExists = await Customer.findOne({ user: req.user._id });
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const bookings = await Booking.find({ customer: customerExists._id })
      .populate("service", "serviceName price category")
      .populate("assignedEmployees", "fullName designation")
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Field Agent — View my assigned jobs
// (Spec — "mobile application for field agents")
// ======================================
export const getMyAssignedBookings = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee profile linked to this account.",
      });
    }

    const bookings = await Booking.find({
      assignedEmployees: employee._id,
      status: { $nin: ["Cancelled"] },
    })
      .populate("customer", "fullName phone address city")
      .populate("service", "serviceName duration")
      .sort({ bookingDate: 1 });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Field Agent — Geolocated check-in at job site
// ======================================
export const checkInBooking = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const employee = await Employee.findOne({ user: req.user._id });
    const isAssigned =
      employee &&
      booking.assignedEmployees.some((e) => e.toString() === employee._id.toString());

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking.",
      });
    }

    if (booking.checkInAt) {
      return res.status(400).json({ success: false, message: "Already checked in." });
    }

    booking.checkInAt = new Date();
    if (typeof lat === "number" && typeof lng === "number") {
      booking.checkInLocation = { lat, lng };
    }
    booking.status = "In Progress";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Checked in successfully.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Field Agent — Submit service report (text, before/after photos,
// customer signature) + geolocated check-out
// (Spec 3.3)
// ======================================
export const submitServiceReport = async (req, res) => {
  try {
    const {
      lat,
      lng,
      serviceReport,
      beforePhotos,
      afterPhotos,
      customerSignature,
    } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const employee = await Employee.findOne({ user: req.user._id });
    const isAssigned =
      employee &&
      booking.assignedEmployees.some((e) => e.toString() === employee._id.toString());

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking.",
      });
    }

    if (!booking.checkInAt) {
      return res.status(400).json({
        success: false,
        message: "Check in before submitting a service report.",
      });
    }

    booking.checkOutAt = new Date();
    if (typeof lat === "number" && typeof lng === "number") {
      booking.checkOutLocation = { lat, lng };
    }

    if (serviceReport) booking.serviceReport = serviceReport;
    if (Array.isArray(beforePhotos)) booking.beforePhotos = beforePhotos;
    if (Array.isArray(afterPhotos)) booking.afterPhotos = afterPhotos;
    if (customerSignature) {
      booking.customerSignature = customerSignature;
      booking.signedAt = new Date();
    }

    booking.status = "Completed";
    booking.completedAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Service report submitted successfully.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get All Bookings
// ======================================
export const getBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees")
      .populate("createdBy", "fullName role")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Booking
// ======================================
export const getBookingById = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id)
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees")
      .populate("createdBy", "fullName role");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Update Booking
// ======================================
export const updateBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Customer Validation
    if (req.body.customer) {
      const customer = await Customer.findById(req.body.customer);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }
    }

    // Service Validation
    if (req.body.service) {
      const service = await Service.findById(req.body.service);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found.",
        });
      }

      req.body.totalAmount = service.price;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees")
      .populate("createdBy", "fullName role");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      booking: updatedBooking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Booking
// ======================================
export const deleteBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Don't allow deleting completed bookings
    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed bookings cannot be deleted.",
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Smart Assignment Engine (Spec 3.4)
// Suggest the best-ranked agents for a booking based on
// availability, skills (department), geographic location, and
// current workload -- without committing anything.
// ======================================
export const suggestAssignment = async (req, res) => {
  try {
    const result = await suggestAgentsForBooking(req.params.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Smart Assignment Engine (Spec 3.4)
// Auto-assign the top-ranked agent(s) to a booking.
// ======================================
export const autoAssignBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const { suggestions, employeesRequired, understaffed } =
      await suggestAgentsForBooking(req.params.id);

    if (suggestions.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "No available, qualified agents found for this booking. Please assign manually.",
      });
    }

    const chosen = suggestions.slice(0, employeesRequired);

    booking.assignedEmployees = chosen.map((c) => c.employeeId);
    booking.status = "Assigned";
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees");

    res.status(200).json({
      success: true,
      message: understaffed
        ? `Assigned ${chosen.length} of ${employeesRequired} required agent(s) -- no more qualified agents were available.`
        : "Best-matched agent(s) assigned successfully.",
      understaffed,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Smart Assignment Engine (Spec 3.4)
// Scheduling conflict / understaffing / overstaffing alerts.
// ======================================
export const getSchedulingAlerts = async (req, res) => {
  try {
    const { from, to } = req.query;
    const alerts = await getStaffingAlerts({ from, to });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Assign Employees to Booking
// ======================================
export const assignEmployees = async (req, res) => {
  try {

    const { employeeIds } = req.body;

    if (!employeeIds || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one employee.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Check Employees
    const employees = await Employee.find({
      _id: { $in: employeeIds },
      status: "Active",
    });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more employees are invalid or inactive.",
      });
    }

    // Check Availability
    const bookedEmployees = await Booking.find({
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      assignedEmployees: {
        $in: employeeIds,
      },
      status: {
        $nin: ["Cancelled", "Completed"],
      },
      _id: { $ne: booking._id },
    });

    if (bookedEmployees.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "One or more employees are already assigned to another booking at this time.",
      });
    }

    booking.assignedEmployees = employeeIds;
    booking.status = "Assigned";

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees");

    res.status(200).json({
      success: true,
      message: "Employees assigned successfully.",
      booking: updatedBooking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Booking Status
// ======================================
export const updateBookingStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const allowedStatus = [
      "Pending",
      "Confirmed",
      "Assigned",
      "In Progress",
      "Completed",
      "Approved",
      "In Dispute",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Manager sign-off can only happen once the field agent has
    // actually submitted the completed job (Spec 3.3).
    if (status === "Approved" && booking.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Only a Completed booking can be approved.",
      });
    }

    booking.status = status;

    if (status === "Completed") {
      booking.completedAt = new Date();
    }

    if (status === "Approved") {
      booking.approvedBy = req.user._id;
      booking.approvedAt = new Date();
    }

    if (status === "In Dispute") {
      booking.disputedAt = new Date();
      if (req.body.disputeReason) booking.disputeReason = req.body.disputeReason;
    }

    await booking.save();
    const customerData = await Customer.findById(booking.customer);

if (customerData) {
  try {
    await sendEmail(
      customerData.email,
      "Booking Status Updated",
      `
      <h2>Booking Update</h2>

      <p>Hello ${customerData.fullName},</p>

      <p>Your booking status has been updated.</p>

      <p><strong>Current Status:</strong> ${booking.status}</p>

      <p>Thank you for choosing Pro Master Cleaning.</p>
      `
    );
  } catch (error) {
    console.log(error.message);
  }
}

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Payment Status
// ======================================
export const updatePaymentStatus = async (req, res) => {
  try {

    const { paymentStatus } = req.body;

    const allowedStatus = [
      "Pending",
      "Paid",
      "Partially Paid",
      "Refunded",
    ];

    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") {
  booking.status = "Confirmed";
}

    await booking.save();
    const customerData = await Customer.findById(booking.customer);

if (customerData && paymentStatus === "Paid") {
  try {
    await sendEmail(
      customerData.email,
      "Payment Received",
      `
      <h2>Payment Successful</h2>

      <p>Hello ${customerData.fullName},</p>

      <p>We have successfully received your payment.</p>

      <p>Your booking has now been confirmed.</p>

      <p>Thank you for choosing Pro Master Cleaning.</p>
      `
    );
  } catch (error) {
    console.log(error.message);
  }
}

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Get Today's Bookings
// ======================================
export const getTodaysBookings = async (req, res) => {
  try {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const bookings = await Booking.find({
      bookingDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees");

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Upcoming Bookings
// ======================================
export const getUpcomingBookings = async (req, res) => {
  try {

    const today = new Date();

    const bookings = await Booking.find({
      bookingDate: {
        $gt: today,
      },
      status: {
        $nin: ["Completed", "Cancelled"],
      },
    })
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees")
      .sort({
        bookingDate: 1,
      });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Booking Statistics
// ======================================
export const getBookingStatistics = async (req, res) => {
  try {

    const totalBookings = await Booking.countDocuments();

    const pending = await Booking.countDocuments({
      status: "Pending",
    });

    const confirmed = await Booking.countDocuments({
      status: "Confirmed",
    });

    const assigned = await Booking.countDocuments({
      status: "Assigned",
    });

    const inProgress = await Booking.countDocuments({
      status: "In Progress",
    });

    const completed = await Booking.countDocuments({
      status: "Completed",
    });

    const cancelled = await Booking.countDocuments({
      status: "Cancelled",
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalBookings,
        pending,
        confirmed,
        assigned,
        inProgress,
        completed,
        cancelled,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Revenue Summary
// ======================================
export const getRevenueSummary = async (req, res) => {
  try {

    const revenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totalRevenue:
        revenue.length > 0
          ? revenue[0].totalRevenue
          : 0,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Monthly Revenue
// ======================================
export const getMonthlyRevenue = async (req, res) => {
  try {

    const revenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      revenue,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Recent Bookings
// ======================================
export const getRecentBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate("customer")
      .populate("service")
      .populate("assignedEmployees")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};