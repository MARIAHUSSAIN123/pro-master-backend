import Contract from "../models/Contract.js";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import sendEmail from "../utils/sendEmail.js";
import stripe from "../config/stripe.js";

// Spec 3.5 — "One-time billing and automated recurring billing (schedule)."
//
// No external cron package is used on purpose (keeps the dependency
// list small) — this runs on plain setInterval, which is fine at this
// scale (a few thousand service calls/month). If the deployment later
// runs multiple server instances, swap this for a proper job queue
// (e.g. BullMQ) or a single dedicated worker process so the same
// contract isn't billed twice by two processes at once.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INVOICE_DUE_DAYS = 14; // how many days a customer has to pay

const FREQUENCY_DAYS = {
  Daily: 1,
  Weekly: 7,
  "Bi-Weekly": 14,
  Monthly: 30,
  Quarterly: 91,
};

const advanceDate = (date, frequency) => {
  const days = FREQUENCY_DAYS[frequency];
  const next = new Date(date);
  if (!days) return null; // "One-Time" contracts are never auto-rebilled
  next.setDate(next.getDate() + days);
  return next;
};

const generateBookingNumber = () =>
  `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateInvoiceNumber = () => "INV-" + Date.now().toString().slice(-8);

/**
 * Find every Active recurring contract whose nextBillingDate has
 * arrived, and for each one:
 *  1. Create the service call (Booking), linked back to the contract
 *     (Spec 3.3 — "automatically generated from a recurring contract").
 *  2. Raise the Invoice for that booking (Spec 3.5).
 *  3. Notify the customer.
 *  4. Roll nextBillingDate forward so it isn't billed again this cycle.
 */
export const generateDueContractBilling = async () => {
  const now = new Date();

  const dueContracts = await Contract.find({
    status: "Active",
    frequency: { $ne: "One-Time" },
    nextBillingDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  }).populate("customer site services");

  const results = [];

  for (const contract of dueContracts) {
    try {
      const primaryService = contract.services?.[0];
      if (!primaryService) {
        // Nothing billable configured on this contract — skip rather
        // than crash the whole run, and leave it for a human to fix.
        results.push({ contract: contract.contractNumber, skipped: "no linked service" });
        continue;
      }

      const booking = await Booking.create({
        bookingNumber: generateBookingNumber(),
        customer: contract.customer._id,
        service: primaryService._id,
        contract: contract._id,
        bookingDate: contract.nextBillingDate,
        bookingTime: "09:00 AM",
        address: contract.site?.address || contract.customer.address,
        status: "Confirmed",
        totalAmount: contract.rate,
        paymentMethod: contract.customer.billingMethod || "Cash",
        notes: `Auto-generated from recurring contract ${contract.contractNumber}`,
      });

      const invoice = await Invoice.create({
        invoiceNumber: generateInvoiceNumber(),
        booking: booking._id,
        customer: contract.customer._id,
        subtotal: contract.rate,
        tax: 0,
        discount: 0,
        totalAmount: contract.rate,
        dueDate: new Date(Date.now() + INVOICE_DUE_DAYS * MS_PER_DAY),
        notes: `Recurring invoice for contract ${contract.contractNumber}`,
      });

      // Decision 2 (Option B) — commercial/recurring customers who
      // opted into auto-pay get charged immediately on their saved
      // card, instead of waiting on a manual invoice payment.
      if (
        contract.autoPayEnabled &&
        contract.customer.stripeCustomerId &&
        contract.customer.savedPaymentMethodId
      ) {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(contract.rate * 100),
            currency: "cad",
            customer: contract.customer.stripeCustomerId,
            payment_method: contract.customer.savedPaymentMethodId,
            off_session: true,
            confirm: true,
            metadata: {
              invoiceId: invoice._id.toString(),
              bookingId: booking._id.toString(),
              customerId: contract.customer._id.toString(),
              contractId: contract._id.toString(),
            },
          });

          if (paymentIntent.status === "succeeded") {
            await Payment.create({
              paymentNumber: "PAY-" + Date.now().toString().slice(-8),
              booking: booking._id,
              invoice: invoice._id,
              customer: contract.customer._id,
              amount: contract.rate,
              paymentMethod: "Stripe",
              paymentStatus: "Completed",
              transactionId: paymentIntent.id,
              notes: `Auto-charged for recurring contract ${contract.contractNumber}`,
            });

            invoice.paymentStatus = "Paid";
            await invoice.save();

            booking.paymentStatus = "Paid";
            await booking.save();
          }
        } catch (chargeErr) {
          // Card declined, expired, etc. — leave the invoice as
          // "Pending" so the normal overdue-reminder flow picks it
          // up, and let the customer know the auto-charge failed.
          console.log(
            `Auto-pay charge failed for contract ${contract.contractNumber}:`,
            chargeErr.message
          );

          if (contract.customer.user) {
            await Notification.create({
              recipient: contract.customer.user,
              type: "PaymentReminder",
              title: "Automatic payment failed",
              body: `We couldn't charge your saved card for invoice ${invoice.invoiceNumber} (${chargeErr.message}). Please update your payment method or pay manually.`,
              channels: ["InApp", "Email"],
              relatedModel: "Invoice",
              relatedId: invoice._id,
            });
          }
        }
      }

      if (contract.customer.user) {
        await Notification.create({
          recipient: contract.customer.user,
          type: "InvoiceCreated",
          title: "New invoice from your recurring service contract",
          body: `Invoice ${invoice.invoiceNumber} for ${contract.rate} has been generated for your ${contract.frequency.toLowerCase()} service under contract ${contract.contractNumber}.`,
          channels: ["InApp", "Email"],
          relatedModel: "Invoice",
          relatedId: invoice._id,
        });
      }

      try {
        if (contract.customer.email) {
          await sendEmail(
            contract.customer.email,
            "New Invoice — Recurring Service",
            `<h2>New Invoice</h2>
            <p>Hello ${contract.customer.fullName},</p>
            <p>A new invoice <strong>${invoice.invoiceNumber}</strong> for <strong>${contract.rate}</strong> has been generated for your recurring contract ${contract.contractNumber}.</p>
            <p>Due date: ${invoice.dueDate.toDateString()}</p>`
          );
        }
      } catch (emailErr) {
        console.log("Recurring billing email error:", emailErr.message);
      }

      contract.lastBilledAt = now;
      contract.nextBillingDate = advanceDate(contract.nextBillingDate, contract.frequency);
      // If the contract has an end date and the next cycle would fall
      // past it, stop billing further.
      if (contract.endDate && contract.nextBillingDate > contract.endDate) {
        contract.status = "Expired";
      }
      await contract.save();

      results.push({
        contract: contract.contractNumber,
        booking: booking.bookingNumber,
        invoice: invoice.invoiceNumber,
      });
    } catch (err) {
      console.log(`Recurring billing failed for contract ${contract.contractNumber}:`, err.message);
      results.push({ contract: contract.contractNumber, error: err.message });
    }
  }

  return results;
};

/**
 * Spec 3.5 — "Tracking payments, sending reminders". Finds unpaid,
 * overdue invoices that haven't had a reminder sent in the last 3
 * days, and sends one (in-app notification + email).
 */
export const sendOverdueInvoiceReminders = async () => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * MS_PER_DAY);

  const overdueInvoices = await Invoice.find({
    paymentStatus: { $in: ["Pending", "Partially Paid"] },
    dueDate: { $lt: now },
    $or: [
      { lastReminderSentAt: null },
      { lastReminderSentAt: { $lt: threeDaysAgo } },
    ],
  }).populate("customer");

  const results = [];

  for (const invoice of overdueInvoices) {
    try {
      const customer = invoice.customer;
      if (!customer) continue;

      if (customer.user) {
        await Notification.create({
          recipient: customer.user,
          type: "PaymentReminder",
          title: "Payment reminder",
          body: `Invoice ${invoice.invoiceNumber} for ${invoice.totalAmount} is overdue (was due ${invoice.dueDate.toDateString()}). Please arrange payment.`,
          channels: ["InApp", "Email"],
          relatedModel: "Invoice",
          relatedId: invoice._id,
        });
      }

      try {
        if (customer.email) {
          await sendEmail(
            customer.email,
            "Payment Reminder",
            `<h2>Payment Reminder</h2>
            <p>Hello ${customer.fullName},</p>
            <p>Invoice <strong>${invoice.invoiceNumber}</strong> for <strong>${invoice.totalAmount}</strong> was due on ${invoice.dueDate.toDateString()} and is still unpaid.</p>
            <p>Please arrange payment at your earliest convenience.</p>`
          );
        }
      } catch (emailErr) {
        console.log("Payment reminder email error:", emailErr.message);
      }

      invoice.lastReminderSentAt = now;
      await invoice.save();

      results.push({ invoice: invoice.invoiceNumber, reminded: true });
    } catch (err) {
      console.log(`Reminder failed for invoice ${invoice.invoiceNumber}:`, err.message);
    }
  }

  return results;
};

let schedulerHandle = null;

/**
 * Starts the background scheduler. Runs once immediately (to catch up
 * on anything due while the server was down), then every hour.
 */
export const startRecurringBillingScheduler = () => {
  const runCycle = async () => {
    try {
      await generateDueContractBilling();
      await sendOverdueInvoiceReminders();
    } catch (err) {
      console.log("Scheduler cycle error:", err.message);
    }
  };

  runCycle();
  schedulerHandle = setInterval(runCycle, 60 * 60 * 1000); // hourly
  return schedulerHandle;
};

export const stopRecurringBillingScheduler = () => {
  if (schedulerHandle) clearInterval(schedulerHandle);
};