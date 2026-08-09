import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Site from "../models/Site.js";
import Contract from "../models/Contract.js";
import Invoice from "../models/Invoice.js";
import Quote from "../models/Quote.js";
import Payment from "../models/Payment.js";

// ======================================
// Create Customer
// ======================================
export const createCustomer = async (req, res) => {
  try {
    const {
      user,
      fullName,
      email,
      phone,
      companyName,
      address,
      city,
      province,
      postalCode,
      customerType,
      billingMethod,
      notes,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists.",
      });
    }

    const customer = await Customer.create({
      ...(user ? { user } : {}),
      fullName,
      email: email.toLowerCase(),
      phone,
      companyName,
      address,
      city,
      province,
      postalCode,
      customerType,
      billingMethod,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email or linked account already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Customers
// ======================================
export const getCustomers = async (req, res) => {
  try {

    const customers = await Customer.find()
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalCustomers: customers.length,
      customers,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Customer
// ======================================
export const getCustomerById = async (req, res) => {
  try {

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const totalBookings =
      await Booking.countDocuments({
        customer: customer._id,
      });

    res.status(200).json({
      success: true,
      customer,
      totalBookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Customer
// ======================================
export const updateCustomer = async (req, res) => {
  try {

    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      customer,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Customer
// ======================================
export const deleteCustomer = async (req, res) => {
  try {

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const bookingExists =
      await Booking.findOne({
        customer: customer._id,
      });

    if (bookingExists) {
      return res.status(400).json({
        success: false,
        message:
          "Customer has bookings. Delete bookings first.",
      });
    }

    const siteExists = await Site.findOne({ customer: customer._id });

    if (siteExists) {
      return res.status(400).json({
        success: false,
        message: "Customer has sites on file. Remove them first.",
      });
    }

    const contractExists = await Contract.findOne({
      customer: customer._id,
    });

    if (contractExists) {
      return res.status(400).json({
        success: false,
        message: "Customer has contracts on file. Remove them first.",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Customer Portal — "My Profile"
// (Spec 3.2 — "Customer Portal: View service calls, quotes/invoices,
// and request services")
// ======================================
export const getMyCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const sites = await Site.find({ customer: customer._id });
    const contracts = await Contract.find({ customer: customer._id })
      .populate("site", "siteName address")
      .populate("services", "serviceName");

    res.status(200).json({
      success: true,
      customer,
      sites,
      contracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — Update own contact info only
// (billingMethod/contact fields — not customerType, not isActive)
// ======================================
export const updateMyCustomerProfile = async (req, res) => {
  try {
    const { phone, address, city, province, postalCode, billingMethod } =
      req.body;

    const customer = await Customer.findOneAndUpdate(
      { user: req.user._id },
      { phone, address, city, province, postalCode, billingMethod },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// Customer Dashboard
// ======================================
export const getCustomerDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const [
      sites,
      contracts,
      bookings,
      invoices,
      quotes,
      payments,
    ] = await Promise.all([
      Site.find({ customer: id }).sort({ createdAt: -1 }),

      Contract.find({ customer: id })
        .populate("site", "siteName address")
        .populate("services", "serviceName"),

      Booking.find({ customer: id })
        .populate("service", "serviceName price")
        .populate("assignedEmployees", "fullName")
        .sort({ bookingDate: -1 }),

      Invoice.find({ customer: id }).sort({ createdAt: -1 }),

      Quote.find({ customer: id }).sort({ createdAt: -1 }),

      Payment.find({ customer: id }).sort({ createdAt: -1 }),
    ]);

    const statistics = {
      totalSites: sites.length,

      totalContracts: contracts.length,

      totalBookings: bookings.length,

      completedBookings: bookings.filter(
        (b) => b.status === "Completed"
      ).length,

      pendingBookings: bookings.filter(
        (b) =>
          b.status === "Pending" ||
          b.status === "Confirmed" ||
          b.status === "Assigned"
      ).length,

      totalRevenue: payments
        .filter((p) => p.status === "Paid")
        .reduce((sum, p) => sum + p.amount, 0),

      outstandingBalance: invoices
        .filter((i) => i.paymentStatus !== "Paid")
        .reduce((sum, i) => sum + i.totalAmount, 0),
    };

    res.status(200).json({
      success: true,

      customer,

      sites,

      contracts,

      bookings,

      invoices,

      quotes,

      payments,

      statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};