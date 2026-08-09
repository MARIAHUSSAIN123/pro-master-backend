import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// Vercel entry point. Vercel's Node.js runtime treats any (req, res)
// handler exported from a file under /api/ as a serverless function,
// and Express apps are already valid (req, res) handlers — so we just
// need to make sure the (cached) DB connection is ready before we
// hand the request to Express.
//
// This is deliberately separate from src/server.js: that file does
// app.listen() + starts the in-process billing scheduler, neither of
// which make sense here (Vercel doesn't keep this process alive
// between requests — see services/recurringBillingScheduler.js and
// routes/cronRoutes.js for how recurring billing is handled instead
// on this deployment target).
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
  return app(req, res);
}
