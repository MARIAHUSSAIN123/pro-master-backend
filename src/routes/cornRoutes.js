import express from "express";
import {
  generateDueContractBilling,
  sendOverdueInvoiceReminders,
} from "../services/recurringBillingScheduler.js";
import { sendSavedQuoteReminders } from "../services/quoteReminderScheduler.js";

const router = express.Router();

// Spec 3.5 — automated recurring billing (schedule) + payment reminders.
//
// On a traditional/VPS deployment this same work happens via the
// in-process setInterval in services/recurringBillingScheduler.js
// (started from server.js). On Vercel there's no long-running process
// for setInterval to live in, so instead a Vercel Cron Job (see
// vercel.json) hits this route once a day.
//
// Vercel automatically attaches "Authorization: Bearer <CRON_SECRET>"
// to requests it sends to a cron path, as long as a CRON_SECRET
// environment variable is set on the project — set one and Vercel
// wires it up. We check it here so this endpoint can't be triggered
// by anyone who simply finds the URL.
router.get("/run-billing", async (req, res) => {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (expected && authHeader !== `Bearer ${expected}`) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  try {
    const billingResults = await generateDueContractBilling();
    const reminderResults = await sendOverdueInvoiceReminders();

    res.status(200).json({
      success: true,
      message: "Recurring billing cycle executed.",
      billingResults,
      reminderResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Client requirement — 24h "come back and pay" reminder for quotes
// left in the customer's cart. Separate route so it can be scheduled
// independently in vercel.json (e.g. its own daily cron entry).
router.get("/run-quote-reminders", async (req, res) => {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (expected && authHeader !== `Bearer ${expected}`) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  try {
    const results = await sendSavedQuoteReminders();
    res.status(200).json({
      success: true,
      message: "Saved-quote reminder cycle executed.",
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;