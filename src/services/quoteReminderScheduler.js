import Quote from "../models/Quote.js";
import Notification from "../models/Notification.js";
import sendEmail from "../utils/sendEmail.js";
import sendSms from "../utils/sendSms.js";

// Client requirement: "For customers who have saved their quote, a
// reminder and prompt to place an order will be automatically sent
// via email and text message after 24 hours."
//
// Same no-external-cron-package philosophy as
// services/recurringBillingScheduler.js — plain setInterval is fine
// at this scale, and Vercel instead hits the /api/cron route below
// once a day (see routes/cronRoutes.js).
//
// SMS: recorded on the Notification with channel "SMS" and status
// "Pending" — there's no SMS provider (Twilio, etc.) configured yet,
// so this is the drop-in point once those credentials exist in .env
// (see utils/sendNotification.js for the same note on the InApp/Email
// path already wired up).

const MS_PER_HOUR = 60 * 60 * 1000;
const REMINDER_DELAY_HOURS = 24;

export const sendSavedQuoteReminders = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - REMINDER_DELAY_HOURS * MS_PER_HOUR);

  const savedQuotes = await Quote.find({
    status: "Saved",
    savedAt: { $lte: cutoff },
    reminderSentAt: null,
  }).populate("customer");

  const results = [];

  for (const quote of savedQuotes) {
    try {
      const customer = quote.customer;
      if (!customer) continue;

      // Only create an in-app Notification if this customer has a
      // linked login account (Notification.recipient is required) —
      // walk-in/manually-added customers without a user account
      // still get the email + SMS below, just no in-app notification.
      if (customer.user) {
        await Notification.create({
          recipient: customer.user,
          type: "PaymentReminder",
          title: "Your quote is waiting",
          body: `Your quote ${quote.quoteNumber} for $${quote.totalAmount} is still saved in your cart. Place your order today!`,
          channels: ["InApp", "Email", "SMS"],
          relatedModel: "Quote",
          relatedId: quote._id,
        });
      }

      try {
        if (customer.email) {
          await sendEmail(
            customer.email,
            "Don't forget your quote!",
            `<h2>Still thinking it over?</h2>
             <p>Hi ${customer.fullName},</p>
             <p>Your quote <strong>${quote.quoteNumber}</strong> for
             <strong>$${quote.totalAmount}</strong> is saved and ready
             whenever you are. Log in to your account to complete your
             order in just a couple of clicks.</p>`
          );
        }
      } catch (emailErr) {
        console.log("Saved-quote reminder email error:", emailErr.message);
      }

      try {
        if (customer.phone) {
          await sendSms(
            customer.phone,
            `Pro Master Cleaning: your quote ${quote.quoteNumber} ($${quote.totalAmount}) is still in your cart. Log in to complete your order.`
          );
        }
      } catch (smsErr) {
        console.log("Saved-quote reminder SMS error:", smsErr.message);
      }

      quote.reminderSentAt = now;
      await quote.save();

      results.push({ quote: quote.quoteNumber, reminded: true });
    } catch (err) {
      console.log(`Saved-quote reminder failed for ${quote.quoteNumber}:`, err.message);
    }
  }

  return results;
};

let schedulerHandle = null;

/**
 * Starts the background scheduler for saved-quote reminders. Runs
 * once immediately (to catch up on anything due while the server was
 * down), then hourly — the 24h/reminderSentAt check above is what
 * actually decides who gets reminded on any given run.
 */
export const startQuoteReminderScheduler = () => {
  const runCycle = async () => {
    try {
      await sendSavedQuoteReminders();
    } catch (err) {
      console.log("Quote reminder scheduler cycle error:", err.message);
    }
  };

  runCycle();
  schedulerHandle = setInterval(runCycle, MS_PER_HOUR);
  return schedulerHandle;
};

export const stopQuoteReminderScheduler = () => {
  if (schedulerHandle) clearInterval(schedulerHandle);
};