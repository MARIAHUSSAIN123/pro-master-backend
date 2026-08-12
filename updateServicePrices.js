// One-time script: sets every Service's price to $80.
//
// HOW TO RUN:
// 1. Put this file in your backend project root (same folder as seedAdmin.js).
// 2. Make sure your local .env has MONGODB_URI pointing at the SAME
//    database Vercel production uses (copy the value from Vercel
//    Dashboard -> backend project -> Environment Variables -> MONGODB_URI).
// 3. In the terminal, inside the backend folder, run:
//      node updateServicePrices.js
// 4. You should see a list of every service that was updated.
// 5. You can delete this file afterwards, or keep it in case you need
//    to bulk-reset prices again later.

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Service from "./src/models/Service.js";

const NEW_PRICE = 80;

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const services = await Service.find({});

    if (services.length === 0) {
      console.log("No services found.");
      process.exit(0);
    }

    for (const service of services) {
      const oldPrice = service.price;
      service.price = NEW_PRICE;
      await service.save();
      console.log(
        `Updated "${service.serviceName}": $${oldPrice} -> $${NEW_PRICE}`
      );
    }

    console.log(`\n✅ Done. ${services.length} service(s) updated to $${NEW_PRICE}.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update service prices:", error.message);
    process.exit(1);
  }
};

run();
