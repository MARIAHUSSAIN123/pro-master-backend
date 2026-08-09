// One-time script to create the FIRST admin user.
// Run this locally once (from the backend project root):
//   node seedAdmin.js
//
// Needs your existing .env file (same one server.js uses) with
// MONGODB_URI set, since it connects to the same database.

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

// ⚠️ Change these before running, then you can delete this file
// (or at least change the password after your first login).
const ADMIN_NAME = "Emile Atcham";
const ADMIN_EMAIL = "mariahussain021@gmail.com";
const ADMIN_PASSWORD = "ilovedawateislami";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("⚠️  A user with this email already exists — nothing created.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created:");
    console.log("   Email:", admin.email);
    console.log("   Password:", ADMIN_PASSWORD, "(change this after first login)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

run();