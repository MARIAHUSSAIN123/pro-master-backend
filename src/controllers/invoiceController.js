import Invoice from "../models/Invoice.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";

// ======================================
// Create Invoice
// ======================================
export const createInvoice = async (req, res) => {
  try {
    const {
      booking,
      customer,
      tax,
      discount,
      dueDate,
      paymentMethod,
      notes,
    } = req.body;

    // Validate Booking
    const bookingExists = await Booking.findById(booking);

    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Validate Customer
    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Fix: make sure the invoice is actually being raised for the
    // customer who owns the booking.
    if (bookingExists.customer.toString() !== customer) {
      return res.status(400).json({
        success: false,
        message: "This booking does not belong to the given customer.",
      });
    }

    // Prevent Duplicate Invoice
    const alreadyExists = await Invoice.findOne({
      booking,
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Invoice already exists for this booking.",
      });
    }

    // Auto Invoice Number
    const invoiceNumber =
      "INV-" + Date.now().toString().slice(-8);

    const subtotal = bookingExists.totalAmount;

    // Fix: clamp so a discount larger than subtotal+tax can't push
    // totalAmount negative.
    const totalAmount = Math.max(
      0,
      subtotal + Number(tax || 0) - Number(discount || 0)
    );

    const invoice = await Invoice.create({
      invoiceNumber,
      booking,
      customer,
      subtotal,
      tax,
      discount,
      totalAmount,
      dueDate,
      paymentMethod,
      notes,
      createdBy: req.user._id,
    });

    const populatedInvoice =
      await Invoice.findById(invoice._id)
        .populate("booking")
        .populate("customer")
        .populate("createdBy", "fullName role");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice: populatedInvoice,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An invoice with this number already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Invoices
// ======================================
export const getInvoices = async (req, res) => {
  try {

    const invoices = await Invoice.find()
      .populate("booking")
      .populate("customer")
      .populate("createdBy", "fullName role")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalInvoices: invoices.length,
      invoices,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Invoice
// ======================================
export const getInvoiceById = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id)
      .populate("booking")
      .populate("customer")
      .populate("createdBy", "fullName role");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Customer Portal — View my invoices
// (Spec 3.2 — "Customer Portal: View service calls, quotes/invoices")
// ======================================
export const getMyInvoices = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const invoices = await Invoice.find({ customer: customer._id })
      .populate("booking", "bookingNumber bookingDate")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Invoice
// ======================================
export const updateInvoice = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    // Fix: a paid invoice's amounts shouldn't be editable after the
    // fact — that would desync it from the Payment already recorded.
    if (invoice.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid invoices cannot be modified.",
      });
    }

    const {
      tax,
      discount,
      dueDate,
      paymentMethod,
      notes,
    } = req.body;

    invoice.tax =
      tax ?? invoice.tax;

    invoice.discount =
      discount ?? invoice.discount;

    invoice.dueDate =
      dueDate || invoice.dueDate;

    invoice.paymentMethod =
      paymentMethod || invoice.paymentMethod;

    invoice.notes =
      notes || invoice.notes;

    invoice.totalAmount = Math.max(
      0,
      invoice.subtotal + Number(invoice.tax) - Number(invoice.discount)
    );

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate("booking")
      .populate("customer")
      .populate("createdBy", "fullName role");

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      invoice: updatedInvoice,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Invoice
// ======================================
export const deleteInvoice = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    if (invoice.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid invoice cannot be deleted.",
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Mark Invoice As Paid (e.g. cash payment collected in person)
// Fix: previously flipped paymentStatus to "Paid" without creating
// any Payment record, so the invoice/booking said "Paid" while the
// Payment collection (which dashboard revenue is based on) had no
// entry for it at all — money "paid" that the system couldn't see.
// ======================================
export const markInvoicePaid = async (req, res) => {
  try {

    const { paymentMethod, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    if (invoice.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already paid.",
      });
    }

    const paymentNumber = "PAY-" + Date.now().toString().slice(-8);

    const payment = await Payment.create({
      paymentNumber,
      booking: invoice.booking,
      invoice: invoice._id,
      customer: invoice.customer,
      amount: invoice.totalAmount,
      paymentMethod: paymentMethod || invoice.paymentMethod || "Cash",
      paymentStatus: "Completed",
      transactionId: transactionId || "",
      notes: notes || "Recorded via mark-as-paid",
      createdBy: req.user._id,
    });

    invoice.paymentStatus = "Paid";
    await invoice.save();

    const booking = await Booking.findById(invoice.booking);
    if (booking) {
      booking.paymentStatus = "Paid";
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Invoice marked as paid.",
      invoice,
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Invoice Statistics
// ======================================
export const getInvoiceStatistics = async (req, res) => {
  try {

    const totalInvoices =
      await Invoice.countDocuments();

    const pendingInvoices =
      await Invoice.countDocuments({
        paymentStatus: "Pending",
      });

    const paidInvoices =
      await Invoice.countDocuments({
        paymentStatus: "Paid",
      });

    const refundedInvoices =
      await Invoice.countDocuments({
        paymentStatus: "Refunded",
      });

    res.status(200).json({
      success: true,
      statistics: {
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        refundedInvoices,
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
// Revenue Report
// ======================================
export const getInvoiceRevenue = async (req, res) => {
  try {

    const revenue = await Invoice.aggregate([
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
