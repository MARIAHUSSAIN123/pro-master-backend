import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import connectDB from "../src/config/db.js";

const FRONTEND_ORIGIN =
  "https://pro-master-frontend-658p.vercel.app";

export default async function handler(req, res) {
  // ===============================
  // CORS PREFLIGHT
  // ===============================

  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Origin",
      FRONTEND_ORIGIN
    );

    res.setHeader(
      "Access-Control-Allow-Credentials",
      "true"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    res.setHeader(
      "Access-Control-Max-Age",
      "86400"
    );

    return res.status(204).end();
  }

  // ===============================
  // DATABASE CONNECTION
  // ===============================

  try {
    await connectDB();
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }

  // ===============================
  // EXPRESS APP
  // ===============================

  return app(req, res);
}
