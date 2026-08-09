// One-time script to add the remaining services shown on the
// marketing website (Office, Carpet, Industrial, Post Construction,
// Pressure Washing, Sanitization) as real Service records, so they
// show up correctly in the booking dropdown instead of having to be
// typed in one by one through the Add Service form.
//
// Run once from the backend folder:
//   node src/seedMoreServices.js
//
// Safe to run more than once — it skips any service whose name
// already exists instead of creating a duplicate.

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Service from "./models/Service.js";
import Department from "./models/Department.js";

const servicesToAdd = [
  {
    serviceName: "Office Cleaning",
    category: "Commercial",
    description: "A clean office creates a healthier, more productive environment for your employees and clients.",
    duration: "2 Hours",
    price: 200,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  },
  {
    serviceName: "Carpet Cleaning",
    category: "Carpet Cleaning",
    description: "Professional carpet cleaning that restores the beauty, freshness, and lifespan of your carpets through deep cleaning technology.",
    duration: "2 Hours",
    price: 180,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
  },
  {
    serviceName: "Industrial Cleaning",
    category: "Commercial",
    description: "Specialized cleaning for industrial facilities, meeting strict safety standards for warehouses and factories.",
    duration: "4 Hours",
    price: 350,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
  },
  {
    serviceName: "Post Construction Cleanup",
    category: "Post Construction",
    description: "Prepares your property for immediate occupancy by thoroughly cleaning every surface after a renovation or construction project.",
    duration: "5 Hours",
    price: 400,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
  },
  {
    serviceName: "Pressure Washing",
    category: "Residential",
    description: "Restores the original appearance of driveways, sidewalks, patios, decks, and fences by removing dirt, mold, mildew, and grime.",
    duration: "2 Hours",
    price: 220,
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800",
  },
  {
    serviceName: "Sanitization & Disinfection",
    category: "Commercial",
    description: "Hospital-grade disinfectants and advanced techniques to eliminate harmful bacteria, viruses, and germs from high-touch surfaces.",
    duration: "1 Hour",
    price: 160,
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800",
  },
];

const run = async () => {
  await connectDB();

  // Reuse whatever department already exists (created for the first
  // 4 services) instead of hardcoding an id that would only be valid
  // on one specific database.
  let department = await Department.findOne();
  if (!department) {
    department = await Department.create({
      departmentName: "Cleaning Operations",
      description: "Default department for cleaning services.",
    });
    console.log(`Created default department: ${department.departmentName}`);
  }

  for (const svc of servicesToAdd) {
    const exists = await Service.findOne({
      serviceName: { $regex: `^${svc.serviceName}$`, $options: "i" },
    });

    if (exists) {
      console.log(`Skipped (already exists): ${svc.serviceName}`);
      continue;
    }

    await Service.create({
      ...svc,
      department: department._id,
      employeesRequired: 1,
      featured: false,
      status: "Active",
    });

    console.log(`Created: ${svc.serviceName}`);
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});