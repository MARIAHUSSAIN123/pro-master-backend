import Quote from "../models/Quote.js";
import Customer from "../models/Customer.js";
import Site from "../models/Site.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Contract from "../models/Contract.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import stripe from "../config/stripe.js";
import { sendBulkNotification, sendNotification } from "../utils/sendNotification.js";
import sendEmail from "../utils/sendEmail.js";
import { buildQuotePdf, buildInvoicePdf } from "../utils/pdfDocument.js";

const QUOTE_POPULATE = [
  { path: "customer" },
  { path: "site" },
  { path: "items.service", select: "serviceName category price" },
  { path: "createdBy", select: "fullName role" },
];

// Auto-flip a quote to Expired once validUntil has passed, unless
// it's already in a terminal state. Called before returning quotes
// so status is always accurate without needing a cron job.
const applyExpiry = async (quote) => {
  if (
    ["Draft", "Sent"].includes(quote.status) &&
    quote.validUntil < new Date()
  ) {
    quote.status = "Expired";
    await quote.save();
  }
  return quote;
};

// ======================================
// Create Quote
// ======================================
export const createQuote = async (req, res) => {
  try {
    const {
      customer,
      site,
      items,
      tax,
      discount,
      validUntil,
      intendedUse,
      recurringFrequency,
      notes,
    } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and at least one service item are required.",
      });
    }

    if (!validUntil) {
      return res.status(400).json({
        success: false,
        message: "validUntil (quote expiry date) is required.",
      });
    }

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (site) {
      const siteExists = await Site.findById(site);
      if (!siteExists) {
        return res.status(404).json({
          success: false,
          message: "Site not found.",
        });
      }
      if (siteExists.customer.toString() !== customer) {
        return res.status(400).json({
          success: false,
          message: "Site does not belong to this customer.",
        });
      }
    }

    if (intendedUse === "RecurringContract" && !recurringFrequency) {
      return res.status(400).json({
        success: false,
        message:
          "recurringFrequency is required when intendedUse is RecurringContract.",
      });
    }

    // Build line items from the live Service catalog, snapshotting
    // name/price at quote-creation time (Spec 3.5 — "based on a
    // catalog of services and pricing schedules").
    const builtItems = [];
    let subtotal = 0;

    for (const raw of items) {
      if (!raw.service) {
        return res.status(400).json({
          success: false,
          message: "Each item must reference a service.",
        });
      }

      const service = await Service.findById(raw.service);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: `Service not found: ${raw.service}`,
        });
      }

      if (service.status !== "Active") {
        return res.status(400).json({
          success: false,
          message: `Service "${service.serviceName}" is not currently active.`,
        });
      }

      const quantity = Number(raw.quantity) > 0 ? Number(raw.quantity) : 1;

      // Allow an optional per-quote override (e.g. negotiated
      // rate) but fall back to the catalog price.
      const unitPrice =
        raw.unitPrice !== undefined && raw.unitPrice !== null
          ? Number(raw.unitPrice)
          : service.price;

      if (unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "unitPrice cannot be negative.",
        });
      }

      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;

      builtItems.push({
        service: service._id,
        serviceName: service.serviceName,
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    const totalAmount = Math.max(
      0,
      subtotal + Number(tax || 0) - Number(discount || 0)
    );

    const quoteNumber = "QTE-" + Date.now().toString().slice(-8);

    const quote = await Quote.create({
      quoteNumber,
      customer,
      site: site || null,
      items: builtItems,
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      totalAmount,
      intendedUse: intendedUse || "OneTime",
      recurringFrequency:
        intendedUse === "RecurringContract" ? recurringFrequency : undefined,
      validUntil,
      notes,
      createdBy: req.user._id,
    });

    const populatedQuote = await Quote.findById(quote._id).populate(
      QUOTE_POPULATE
    );

    res.status(201).json({
      success: true,
      message: "Quote created successfully.",
      quote: populatedQuote,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A quote with this number already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Quotes (back office)
// ======================================
export const getQuotes = async (req, res) => {
  try {
    const { status, customer } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;

    const quotes = await Quote.find(filter)
      .populate(QUOTE_POPULATE)
      .sort({ createdAt: -1 });

    // Refresh expiry status on read
    await Promise.all(quotes.map(applyExpiry));

    res.status(200).json({
      success: true,
      totalQuotes: quotes.length,
      quotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Quote
// ======================================
export const getQuoteById = async (req, res) => {
  try {
    let quote = await Quote.findById(req.params.id).populate(QUOTE_POPULATE);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    quote = await applyExpiry(quote);

    res.status(200).json({
      success: true,
      quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — View my quotes
// (Spec 3.2 — "Customer Portal: View service calls, quotes/invoices")
// ======================================
export const getMyQuotes = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const quotes = await Quote.find({ customer: customer._id })
      .populate(QUOTE_POPULATE)
      .sort({ createdAt: -1 });

    await Promise.all(quotes.map(applyExpiry));

    res.status(200).json({
      success: true,
      totalQuotes: quotes.length,
      quotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Quote (only while Draft or Sent — not yet decided/converted)
// ======================================
export const updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (!["Draft", "Sent"].includes(quote.status)) {
      return res.status(400).json({
        success: false,
        message: `Quote cannot be edited once it is ${quote.status}.`,
      });
    }

    const { items, tax, discount, validUntil, notes, site } = req.body;

    if (items && Array.isArray(items) && items.length > 0) {
      const builtItems = [];
      let subtotal = 0;

      for (const raw of items) {
        if (!raw.service) {
          return res.status(400).json({
            success: false,
            message: "Each item must reference a service.",
          });
        }

        const service = await Service.findById(raw.service);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: `Service not found: ${raw.service}`,
          });
        }

        const quantity = Number(raw.quantity) > 0 ? Number(raw.quantity) : 1;
        const unitPrice =
          raw.unitPrice !== undefined && raw.unitPrice !== null
            ? Number(raw.unitPrice)
            : service.price;

        const lineTotal = quantity * unitPrice;
        subtotal += lineTotal;

        builtItems.push({
          service: service._id,
          serviceName: service.serviceName,
          quantity,
          unitPrice,
          lineTotal,
        });
      }

      quote.items = builtItems;
      quote.subtotal = subtotal;
    }

    if (site) {
      const siteExists = await Site.findById(site);
      if (!siteExists) {
        return res.status(404).json({
          success: false,
          message: "Site not found.",
        });
      }
      quote.site = site;
    }

    quote.tax = tax ?? quote.tax;
    quote.discount = discount ?? quote.discount;
    quote.validUntil = validUntil || quote.validUntil;
    quote.notes = notes ?? quote.notes;

    quote.totalAmount = Math.max(
      0,
      quote.subtotal + Number(quote.tax) - Number(quote.discount)
    );

    // Editing a quote that was already sent means it needs to go
    // back out to the customer for a fresh decision.
    if (quote.status === "Sent") {
      quote.status = "Draft";
      quote.sentAt = null;
    }

    await quote.save();

    const updatedQuote = await Quote.findById(quote._id).populate(
      QUOTE_POPULATE
    );

    res.status(200).json({
      success: true,
      message: "Quote updated successfully.",
      quote: updatedQuote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Quote (only while Draft)
// ======================================
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (quote.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quotes can be deleted.",
      });
    }

    await quote.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quote deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Send Quote to Customer
// ======================================
export const sendQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (quote.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: `Only draft quotes can be sent. Current status: ${quote.status}.`,
      });
    }

    if (quote.validUntil < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This quote's validUntil date is in the past. Update it before sending.",
      });
    }

 quote.status = "Sent";
    quote.sentAt = new Date();
    await quote.save();

    const populatedQuote = await Quote.findById(quote._id).populate(
      QUOTE_POPULATE
    );

    try {
const customer = populatedQuote.customer;

// Check if portal user already exists
let portalUser = await User.findOne({
  email: customer.email.toLowerCase(),
});

if (!portalUser) {
  return res.status(400).json({
    success: false,
    message:
      "Customer portal account does not exist. Create the customer account before sending the quote.",
  });
}
      if (customer?.email) {
        const itemsHtml = populatedQuote.items
          .map(
            (item) =>
              `<li>${item.serviceName} — Qty: ${item.quantity} × $${item.unitPrice} = $${item.lineTotal}</li>`
          )
          .join("");

        await sendEmail(
          customer.email,
          `Your Quote ${quote.quoteNumber} from Pro Master Cleaning`,
          `<h2>Your Quote is Ready</h2>
           <p>Hi ${customer.fullName},</p>
           <p>Here is your quote <strong>${quote.quoteNumber}</strong>:</p>
           <ul>${itemsHtml}</ul>
           <p>Subtotal: $${quote.subtotal}</p>
           <p>Tax: $${quote.tax}</p>
           <p>Discount: $${quote.discount}</p>
           <p><strong>Total: $${quote.totalAmount}</strong></p>
           <p>Valid until: ${new Date(quote.validUntil).toDateString()}</p>
           <p>Your quote is ready.</p>

<p>
If you don't have a customer portal account yet,
please contact Pro Master Cleaning and we will activate your account.
</p>`
        );
      }
    } catch (emailErr) {
      console.log("Send-quote email error:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Quote sent to customer.",
      quote: populatedQuote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Customer Portal — Accept or Reject a Quote
// ======================================
export const respondToQuote = async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body; // "Accepted" | "Rejected"

    if (!["Accepted", "Rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be 'Accepted' or 'Rejected'.",
      });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    let quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    // A customer may only respond to their own quote (IDOR guard).
    if (quote.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    quote = await applyExpiry(quote);

    if (quote.status !== "Sent") {
      return res.status(400).json({
        success: false,
        message: `Quote cannot be responded to. Current status: ${quote.status}.`,
      });
    }

    quote.status = decision;
    quote.respondedAt = new Date();
    if (decision === "Rejected") {
      quote.rejectionReason = rejectionReason || "";
    }

    await quote.save();

    res.status(200).json({
      success: true,
      message: `Quote ${decision.toLowerCase()}.`,
      quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save Quote to Cart (Customer clicks "Save" instead of paying now)
// Client requirement: quote sits in the customer's cart with a red
// badge reminder, and staff get an immediate alert to follow up.
// ======================================
export const saveQuoteToCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    let quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    // A customer may only save their own quote (IDOR guard).
    if (quote.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    quote = await applyExpiry(quote);

    if (!["Sent", "Accepted"].includes(quote.status)) {
      return res.status(400).json({
        success: false,
        message: `This quote can't be saved to the cart. Current status: ${quote.status}.`,
      });
    }

    quote.status = "Saved";
    quote.savedAt = new Date();
    quote.reminderSentAt = null;
    await quote.save();

    // Alert every admin/manager so the office can track this
    // customer and follow up before the quote expires.
    const staff = await User.find({ role: { $in: ["admin", "manager"] }, isActive: true }).select("_id");
    await sendBulkNotification({
      recipients: staff.map((s) => s._id),
      type: "QuoteSaved",
      title: "Customer saved a quote",
      body: `${customer.fullName} saved quote ${quote.quoteNumber} (${quote.totalAmount}) to their cart instead of paying now. Follow up before it expires.`,
      channels: ["InApp", "Email"],
      relatedModel: "Quote",
      relatedId: quote._id,
    });

    res.status(200).json({
      success: true,
      message: "Quote saved to your cart.",
      quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get My Cart (Customer) — saved quotes awaiting a payment decision.
// Powers the red badge/counter on the customer portal.
// ======================================
export const getMyCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const quotes = await Quote.find({ customer: customer._id, status: "Saved" })
      .populate(QUOTE_POPULATE)
      .sort({ savedAt: -1 });

    res.status(200).json({ success: true, count: quotes.length, quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// "Pay Now" — Create a Stripe Checkout Session for a one-time quote
// (client requirement: pay-now redirects straight to Stripe, like a
// travel-booking checkout). Recurring/contract quotes still go through
// the staff-driven convertQuote flow below — Stripe subscription
// billing for contracts is a separate, larger piece of work.
// ======================================
export const createCheckoutSession = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    let quote = await Quote.findById(req.params.id).populate("items.service");
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    if (quote.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    quote = await applyExpiry(quote);

    // "Sent"/"Saved" cover paying without formally accepting first
    // (Pay Now on a saved quote). "Accepted" covers the "Accept & Pay"
    // button, which calls respondToQuote (Sent -> Accepted) right
    // before opening this checkout — by the time this runs, the
    // quote's status is already "Accepted", not "Sent" anymore.
    if (!["Sent", "Saved", "Accepted"].includes(quote.status)) {
      return res.status(400).json({
        success: false,
        message: `This quote can't be paid right now. Current status: ${quote.status}.`,
      });
    }

    if (quote.intendedUse !== "OneTime") {
      return res.status(400).json({
        success: false,
        message:
          "Instant online payment is only available for one-time services right now. Please contact us for recurring contracts.",
      });
    }

    const { bookingDate, bookingTime, address } = req.body;
    if (!bookingDate || !bookingTime || !address) {
      return res.status(400).json({
        success: false,
        message: "bookingDate, bookingTime and address are required before paying.",
      });
    }

    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: quote.items.map((item) => ({
        price_data: {
          currency: "cad",
          product_data: { name: item.serviceName },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      // Stashed here (not trusted from the client at confirm time) so
      // confirmCheckoutSession can rebuild the booking(s) exactly as
      // quoted, the same pattern createPaymentIntent already uses.
      metadata: {
        quoteId: quote._id.toString(),
        customerId: customer._id.toString(),
        bookingDate,
        bookingTime,
        address: String(address).slice(0, 480),
      },
      success_url: `${frontendUrl}/portal/payment-success?session_id={CHECKOUT_SESSION_ID}&quoteId=${quote._id}`,
      cancel_url: `${frontendUrl}/portal/quotes/${quote._id}`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Confirm the Stripe Checkout Session after the customer is redirected
// back from Stripe's success_url, and turn the paid quote into real
// booking(s) + an invoice + a payment record. Idempotent — safe to
// call more than once (e.g. the user refreshes the success page).
// ======================================
export const confirmCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required." });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const quote = await Quote.findById(req.params.id).populate("items.service");
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    if (quote.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    // Idempotency: already converted (e.g. page refreshed after success).
    if (quote.status === "Converted") {
      const bookings = await Booking.find({ _id: { $in: quote.convertedBookings } });
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed.",
        bookings,
        quote,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment has not completed yet.",
      });
    }

    if (session.metadata?.quoteId !== quote._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "This payment session does not match this quote.",
      });
    }

    const { bookingDate, bookingTime, address } = session.metadata;

    // Atomically claim this quote before doing any work: only the
    // first of two concurrent calls (StrictMode double-invoke, a
    // page refresh racing the original request, etc.) flips status
    // away from non-Converted here — findOneAndUpdate is a single
    // atomic DB operation, so a second call sees claimed === null and
    // returns the existing result instead of creating duplicate
    // bookings/invoices/payments.
    const claimed = await Quote.findOneAndUpdate(
      { _id: quote._id, status: { $ne: "Converted" } },
      { $set: { status: "Converted" } }
    );
    if (!claimed) {
      const freshQuote = await Quote.findById(quote._id);
      const bookings = await Booking.find({ _id: { $in: freshQuote.convertedBookings } });
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed.",
        bookings,
        quote: freshQuote,
      });
    }

    // One booking per quoted service line item, same numbering
    // convention as the staff-driven convertQuote.
    const createdBookings = [];
    for (const item of quote.items) {
      const bookingNumber = "BKG-" + Date.now().toString().slice(-8) + "-" + createdBookings.length;

      const booking = await Booking.create({
        bookingNumber,
        customer: quote.customer,
        service: item.service,
        bookingDate,
        bookingTime,
        address,
        totalAmount: item.lineTotal,
        paymentStatus: "Paid",
        createdBy: req.user._id,
      });

      createdBookings.push(booking);
    }

    // Status was already flipped to "Converted" by the atomic claim
    // above — just record which bookings resulted. A plain update
    // (not quote.save()) avoids Mongoose's version check, since the
    // claim step already changed this document's version underneath
    // the in-memory `quote` object we fetched earlier.
    await Quote.findByIdAndUpdate(quote._id, {
      convertedBookings: createdBookings.map((b) => b._id),
    });
    quote.status = "Converted";
    quote.convertedBookings = createdBookings.map((b) => b._id);

    // One invoice covering the whole quote, linked to the first
    // booking (the Invoice model ties to a single booking).
    const invoiceNumber = "INV-" + Date.now().toString().slice(-8);
    const invoice = await Invoice.create({
      invoiceNumber,
      booking: createdBookings[0]._id,
      customer: quote.customer,
      subtotal: quote.subtotal,
      tax: quote.tax,
      discount: quote.discount,
      totalAmount: quote.totalAmount,
      paymentStatus: "Paid",
      // Invoice.paymentMethod's enum only has Cash / Credit Card /
      // Debit Card / E-Transfer — there's no "Stripe" option, since
      // Stripe itself is a processor, not a payment method. "Credit
      // Card" is the accurate bucket for a Stripe Checkout payment.
      paymentMethod: "Credit Card",
      // Both required by the schema; paid immediately via Stripe, so
      // there's no real due date — use the issue date itself.
      dueDate: new Date(),
      createdBy: req.user._id,
    });

    const paymentNumber = "PAY-" + Date.now().toString().slice(-8);
    const payment = await Payment.create({
      paymentNumber,
      booking: createdBookings[0]._id,
      invoice: invoice._id,
      customer: quote.customer,
      amount: quote.totalAmount,
      paymentMethod: "Stripe",
      paymentStatus: "Completed",
      transactionId: session.payment_intent,
      createdBy: req.user._id,
    });

    // Booking confirmation — the booking number doubles as the case
    // number the client asked for ("case number that will be
    // assigned"). In-app + best-effort email notification.
    await sendNotification({
      recipient: req.user._id,
      type: "BookingConfirmation",
      title: "Booking confirmed",
      body: `Your payment was received. Case number ${createdBookings[0].bookingNumber} has been assigned to your booking.`,
      channels: ["InApp", "Email"],
      relatedModel: "Booking",
      relatedId: createdBookings[0]._id,
    });

    // Let staff know a payment just came in — previously only the
    // customer was notified here, so a completed, paid booking could
    // sit unseen until someone happened to check the admin Bookings
    // page. In-app bell + email to every admin/manager.
    const staffToNotify = await User.find({
      role: { $in: ["admin", "manager"] },
    }).select("_id");

    await sendBulkNotification({
      recipients: staffToNotify.map((u) => u._id),
      type: "BookingConfirmation",
      title: "Payment received",
      body: `${customer.fullName} paid $${quote.totalAmount.toFixed(
        2
      )} for quote ${quote.quoteNumber}. Case number ${createdBookings[0].bookingNumber} was created.`,
      channels: ["InApp", "Email"],
      relatedModel: "Booking",
      relatedId: createdBookings[0]._id,
      createdBy: req.user._id,
    });

    // Email 1 — booking confirmation + case number + Quote PDF.
    try {
      const quotePdf = buildQuotePdf(quote, customer);
      await sendEmail(
        customer.email,
        `Booking Confirmed — Case #${createdBookings[0].bookingNumber}`,
        `<p>Hi ${customer.fullName},</p>
         <p>Thanks for your payment! Your booking is confirmed.</p>
         <p><strong>Case number: ${createdBookings[0].bookingNumber}</strong></p>
         <p>Your quote is attached as a PDF for your records.</p>`,
        [{ filename: `Quote-${quote.quoteNumber}.pdf`, content: quotePdf, contentType: "application/pdf" }]
      );
    } catch (_) {
      // A failed email must never fail the payment confirmation itself.
    }

    // Email 2 — invoice PDF (full customer info, case number, invoice
    // number, order details, total incl. tax).
    try {
      const invoicePdf = buildInvoicePdf(invoice, createdBookings[0], customer);
      await sendEmail(
        customer.email,
        `Your Invoice ${invoice.invoiceNumber}`,
        `<p>Hi ${customer.fullName},</p>
         <p>Please find your invoice attached, covering case number ${createdBookings[0].bookingNumber}.</p>
         <p><strong>Total paid: $${invoice.totalAmount.toFixed(2)}</strong></p>`,
        [{ filename: `Invoice-${invoice.invoiceNumber}.pdf`, content: invoicePdf, contentType: "application/pdf" }]
      );
    } catch (_) {
      // Same — don't let an email failure roll back a real payment.
    }

    res.status(201).json({
      success: true,
      message: "Payment confirmed and booking(s) created.",
      bookings: createdBookings,
      invoice,
      payment,
      quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// (Spec 3.5 — "Converting a quote to a contract or purchase order")
// ======================================
export const convertQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (quote.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: `Only accepted quotes can be converted. Current status: ${quote.status}.`,
      });
    }

    if (quote.intendedUse === "RecurringContract") {
      const { contractNumber, startDate, endDate, billingCycle } = req.body;

      if (!contractNumber || !startDate) {
        return res.status(400).json({
          success: false,
          message: "contractNumber and startDate are required to convert to a contract.",
        });
      }

      if (!quote.site) {
        return res.status(400).json({
          success: false,
          message: "This quote has no site on file; add one before converting to a contract.",
        });
      }

      const contract = await Contract.create({
        contractNumber,
        customer: quote.customer,
        site: quote.site,
        services: quote.items.map((i) => i.service),
        frequency: quote.recurringFrequency,
        rate: quote.totalAmount,
        billingCycle: billingCycle || "Monthly",
        startDate,
        endDate: endDate || null,
        notes: `Converted from quote ${quote.quoteNumber}`,
        createdBy: req.user._id,
      });

      quote.status = "Converted";
      quote.convertedToContract = contract._id;
      await quote.save();

      return res.status(201).json({
        success: true,
        message: "Quote converted to contract.",
        contract,
        quote,
      });
    }

    // One-time purchase order -> one Booking per service line item.
    const { bookingDate, bookingTime, address } = req.body;

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "bookingDate and bookingTime are required to convert to booking(s).",
      });
    }

    let resolvedAddress = address;
    if (!resolvedAddress && quote.site) {
      const site = await Site.findById(quote.site);
      resolvedAddress = site ? site.address : undefined;
    }

    if (!resolvedAddress) {
      return res.status(400).json({
        success: false,
        message: "An address is required (either on the quote's site or provided directly).",
      });
    }

    const createdBookings = [];
    for (const item of quote.items) {
      const bookingNumber = "BKG-" + Date.now().toString().slice(-8) + "-" + createdBookings.length;

      const booking = await Booking.create({
        bookingNumber,
        customer: quote.customer,
        service: item.service,
        bookingDate,
        bookingTime,
        address: resolvedAddress,
        totalAmount: item.lineTotal,
        createdBy: req.user._id,
      });

      createdBookings.push(booking);
    }

    quote.status = "Converted";
    quote.convertedBookings = createdBookings.map((b) => b._id);
    await quote.save();

    res.status(201).json({
      success: true,
      message: "Quote converted to booking(s).",
      bookings: createdBookings,
      quote,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A duplicate booking/contract number was generated. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Quote Statistics
// ======================================
export const getQuoteStatistics = async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const draftQuotes = await Quote.countDocuments({ status: "Draft" });
    const sentQuotes = await Quote.countDocuments({ status: "Sent" });
    const acceptedQuotes = await Quote.countDocuments({ status: "Accepted" });
    const rejectedQuotes = await Quote.countDocuments({ status: "Rejected" });
    const expiredQuotes = await Quote.countDocuments({ status: "Expired" });
    const convertedQuotes = await Quote.countDocuments({ status: "Converted" });

    const acceptanceRate =
      sentQuotes + acceptedQuotes + rejectedQuotes + convertedQuotes > 0
        ? (
            ((acceptedQuotes + convertedQuotes) /
              (acceptedQuotes + rejectedQuotes + convertedQuotes)) *
            100
          ).toFixed(1)
        : "0.0";

    res.status(200).json({
      success: true,
      statistics: {
        totalQuotes,
        draftQuotes,
        sentQuotes,
        acceptedQuotes,
        rejectedQuotes,
        expiredQuotes,
        convertedQuotes,
        acceptanceRate: Number(acceptanceRate),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};