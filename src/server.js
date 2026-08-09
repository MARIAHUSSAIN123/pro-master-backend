import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startRecurringBillingScheduler } from "./services/recurringBillingScheduler.js";
import { startQuoteReminderScheduler } from "./services/quoteReminderScheduler.js";

// This file is the entry point for a traditional/VPS deployment
// (npm run start / npm run dev) — it is NOT used on Vercel. Vercel
// instead imports app.js directly through /api/index.js (see that
// file for why: serverless functions don't keep a process alive for
// app.listen() or setInterval() to run in).
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // Spec 3.5 — automated recurring billing + payment reminders.
      // Only meaningful here because this process stays alive; on
      // Vercel this is replaced by a Cron Job hitting /api/cron/run-billing.
      startRecurringBillingScheduler();
      startQuoteReminderScheduler();
    });
  })
  .catch((error) => {
    console.error("❌ Could not start server — DB connection failed:", error.message);
    process.exit(1);
  });