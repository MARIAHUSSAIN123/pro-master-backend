import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import connectDB from "../src/config/db.js";

export default async function handler(req, res) {
  // Handle CORS preflight request BEFORE database connection
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    const allowedOrigins = (process.env.FRONTEND_URL || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return res.status(204).end();
  }

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
