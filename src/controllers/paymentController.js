import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import stripe from "../config/stripe.js";

// ======================================
// Create Payment
// ======================================
export const createPayment = async (req, res) => {
  try {

    const {
      booking,
      invoice,
      customer,
      amount,
      paymentMethod,
      transactionId,
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

    // Validate Invoice
    const invoiceExists = await Invoice.findById(invoice);

    if (!invoiceExists) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
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

    // Fix: make sure invoice/booking/customer actually belong
    // together — otherwise a payment could get attributed to the
    // wrong customer's invoice.
    if (
      invoiceExists.booking.toString() !== booking ||
      invoiceExists.customer.toString() !== customer
    ) {
      return res.status(400).json({
        success: false,
        message: "Invoice does not match the given booking/customer.",
      });
    }

    // Fix: prevent recording a second payment against an invoice
    // that's already fully paid.
    if (invoiceExists.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This invoice is already paid.",
      });
    }

    // Auto Payment Number
    const paymentNumber =
      "PAY-" + Date.now().toString().slice(-8);

    const payment = await Payment.create({
      paymentNumber,
      booking,
      invoice,
      customer,
      amount,
      paymentMethod,
      transactionId,
      notes,
      paymentStatus: "Completed",
      createdBy: req.user._id,
    });

    // Update Invoice
    invoiceExists.paymentStatus = "Paid";
    await invoiceExists.save();

    // Update Booking
    bookingExists.paymentStatus = "Paid";
    await bookingExists.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate("booking")
      .populate("invoice")
      .populate("customer")
      .populate("createdBy", "fullName role");

    res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      payment: populatedPayment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Payments
// ======================================
export const getPayments = async (req, res) => {
  try {

    const payments = await Payment.find()
      .populate("booking")
      .populate("invoice")
      .populate("customer")
      .populate("createdBy", "fullName role")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalPayments: payments.length,
      payments,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Payment
// ======================================
export const getPaymentById = async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("invoice")
      .populate("customer")
      .populate("createdBy", "fullName role");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    res.status(200).json({
      success: true,
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
// Update Payment
// ======================================
export const updatePayment = async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const {
      amount,
      paymentMethod,
      transactionId,
      notes,
    } = req.body;

    payment.amount =
      amount ?? payment.amount;

    payment.paymentMethod =
      paymentMethod || payment.paymentMethod;

    payment.transactionId =
      transactionId || payment.transactionId;

    payment.notes =
      notes || payment.notes;

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate("booking")
      .populate("invoice")
      .populate("customer")
      .populate("createdBy", "fullName role");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully.",
      payment: updatedPayment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Payment
// ======================================
export const deletePayment = async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.paymentStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed payment cannot be deleted.",
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Refund Payment
// ======================================
export const refundPayment = async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    payment.paymentStatus = "Refunded";

    await payment.save();

    // Update Invoice
    const invoice = await Invoice.findById(payment.invoice);

    if (invoice) {
      invoice.paymentStatus = "Refunded";
      await invoice.save();
    }

    // Update Booking
    const booking = await Booking.findById(payment.booking);

    if (booking) {
      booking.paymentStatus = "Refunded";
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully.",
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
// Payment Statistics
// ======================================
export const getPaymentStatistics = async (req, res) => {
  try {

    const totalPayments =
      await Payment.countDocuments();

    const completedPayments =
      await Payment.countDocuments({
        paymentStatus: "Completed",
      });

    const pendingPayments =
      await Payment.countDocuments({
        paymentStatus: "Pending",
      });

    const refundedPayments =
      await Payment.countDocuments({
        paymentStatus: "Refunded",
      });

    const failedPayments =
      await Payment.countDocuments({
        paymentStatus: "Failed",
      });

    res.status(200).json({
      success: true,
      statistics: {
        totalPayments,
        completedPayments,
        pendingPayments,
        refundedPayments,
        failedPayments,
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
export const getPaymentRevenue = async (req, res) => {
  try {

    const revenue = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
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
// Create Stripe Payment Intent
// ======================================

export const createPaymentIntent = async (req, res) => {
  try {

    const {
      amount,
      currency = "cad",
      invoice,
      booking,
      customer,
    } = req.body;

    const paymentIntent =
      await stripe.paymentIntents.create({

        amount: Math.round(amount * 100),

        currency,

        // Fix: stash the linked records as metadata so confirmStripePayment
        // can create a matching Payment record without trusting the
        // client to resend correct ids at confirm time.
        metadata: {
          invoiceId: invoice || "",
          bookingId: booking || "",
          customerId: customer || "",
        },

        automatic_payment_methods: {
          enabled: true,
        },

      });

    res.status(200).json({

      success: true,

      clientSecret:
        paymentIntent.client_secret,

      paymentIntentId:
        paymentIntent.id,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }
};
// ======================================
// Confirm Stripe Payment
// Fix: this previously only checked the PaymentIntent status with
// Stripe and returned it — it never created a Payment record or
// updated the Invoice/Booking, so a customer could pay by card and
// the system would have no record of it (invoice stays "Pending"
// forever, dashboard revenue misses it entirely).
// ======================================

export const confirmStripePayment = async (req, res) => {

  try {

    const {
      paymentIntentId,
    } = req.body;

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

    if (
      paymentIntent.status !== "succeeded"
    ) {

      return res.status(400).json({

        success: false,

        message: "Payment not completed.",

      });

    }

    const { invoiceId, bookingId, customerId } =
      paymentIntent.metadata || {};

    // If this PaymentIntent isn't linked to an invoice (e.g. a raw
    // charge with no metadata), just return the Stripe confirmation —
    // there's nothing in our system to reconcile against.
    if (!invoiceId || !bookingId || !customerId) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        paymentIntent,
      });
    }

    // Idempotency: if this PaymentIntent was already recorded
    // (e.g. the client retried the confirm call), don't double-record it.
    const alreadyRecorded = await Payment.findOne({
      transactionId: paymentIntentId,
    });

    if (alreadyRecorded) {
      return res.status(200).json({
        success: true,
        message: "Payment already recorded.",
        payment: alreadyRecorded,
      });
    }

    const [invoiceExists, bookingExists] = await Promise.all([
      Invoice.findById(invoiceId),
      Booking.findById(bookingId),
    ]);

    if (!invoiceExists || !bookingExists) {
      return res.status(404).json({
        success: false,
        message:
          "Payment succeeded on Stripe but the linked invoice/booking was not found.",
      });
    }

    const paymentNumber = "PAY-" + Date.now().toString().slice(-8);

    const payment = await Payment.create({
      paymentNumber,
      booking: bookingId,
      invoice: invoiceId,
      customer: customerId,
      amount: paymentIntent.amount / 100,
      paymentMethod: "Stripe",
      paymentStatus: "Completed",
      transactionId: paymentIntentId,
      createdBy: req.user._id,
    });

    invoiceExists.paymentStatus = "Paid";
    await invoiceExists.save();

    bookingExists.paymentStatus = "Paid";
    await bookingExists.save();

    res.status(200).json({

      success: true,

      message: "Payment verified successfully.",

      paymentIntent,
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
// Stripe Refund
// ======================================

export const refundStripePayment = async (req, res) => {

  try {

    const {
      paymentIntentId,
    } = req.body;

    const refund =
      await stripe.refunds.create({

        payment_intent:
          paymentIntentId,

      });

    // Fix: reflect the refund in our own Payment/Invoice/Booking
    // records too — previously this only refunded on Stripe's side
    // and left our database saying "Completed"/"Paid".
    const payment = await Payment.findOne({
      transactionId: paymentIntentId,
    });

    if (payment) {
      payment.paymentStatus = "Refunded";
      await payment.save();

      const invoice = await Invoice.findById(payment.invoice);
      if (invoice) {
        invoice.paymentStatus = "Refunded";
        await invoice.save();
      }

      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = "Refunded";
        await booking.save();
      }
    }

    res.status(200).json({

      success: true,

      message: "Refund completed.",

      refund,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// ======================================
// Create Setup Intent (save a card for future auto-charges)
// Used for recurring/commercial customers who opt into automatic
// online payment — collects card details once, without charging
// anything, so it can be reused every billing cycle.
// ======================================

export const createSetupIntent = async (req, res) => {
  try {
    const { customerId } = req.body;

    const customerExists = await Customer.findById(customerId);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Reuse the existing Stripe Customer if we already made one,
    // otherwise create a new one and save its id for next time.
    let stripeCustomerId = customerExists.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        name: customerExists.fullName,
        email: customerExists.email,
        phone: customerExists.phone,
        metadata: {
          customerId: customerExists._id.toString(),
        },
      });

      stripeCustomerId = stripeCustomer.id;
      customerExists.stripeCustomerId = stripeCustomerId;
      await customerExists.save();
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session", // so it can be charged automatically later
    });

    res.status(200).json({
      success: true,
      clientSecret: setupIntent.client_secret,
      stripeCustomerId,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Confirm Setup Intent (called after the customer submits their
// card on the frontend) — saves the resulting PaymentMethod id on
// the customer so the recurring billing scheduler can charge it.
// ======================================

export const confirmSetupIntent = async (req, res) => {
  try {
    const { setupIntentId, customerId } = req.body;

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Card setup not completed.",
      });
    }

    const customerExists = await Customer.findById(customerId);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    customerExists.savedPaymentMethodId = setupIntent.payment_method;
    await customerExists.save();

    res.status(200).json({
      success: true,
      message: "Card saved successfully.",
      savedPaymentMethodId: setupIntent.payment_method,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
