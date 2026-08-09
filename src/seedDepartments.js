// One-time script to add a department for each service category shown
// on the marketing website. Run once from the backend folder:
//
//   node src/seedDepartments.js
//
// Safe to run more than once — skips any department name that
// already exists instead of creating a duplicate.

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Department from "./models/Department.js";

const departmentsToAdd = [
  { departmentName: "Commercial Cleaning", color: "#2563eb", description: "Handles commercial cleaning contracts (offices, retail, condos)." },
  { departmentName: "Residential Cleaning", color: "#16a34a", description: "Handles one-time and recurring residential cleaning jobs." },
  { departmentName: "Office Cleaning", color: "#0891b2", description: "Handles office cleaning services." },
  { departmentName: "Carpet Cleaning", color: "#a855f7", description: "Handles carpet deep-cleaning jobs." },
  { departmentName: "Window Cleaning", color: "#0ea5e9", description: "Handles window cleaning jobs." },
  { departmentName: "Industrial Cleaning", color: "#f59e0b", description: "Handles industrial/warehouse cleaning jobs." },
  { departmentName: "Post Construction Cleanup", color: "#ef4444", description: "Handles post-construction/renovation cleanup jobs." },
  { departmentName: "Pressure Washing", color: "#14b8a6", description: "Handles exterior pressure washing jobs." },
  { departmentName: "Sanitization & Disinfection", color: "#dc2626", description: "Handles sanitization and disinfection jobs." },
];

const run = async () => {
  await connectDB();

  for (const dept of departmentsToAdd) {
    const exists = await Department.findOne({
      departmentName: { $regex: `^${dept.departmentName}$`, $options: "i" },
    });

    if (exists) {
      console.log(`Skipped (already exists): ${dept.departmentName}`);
      continue;
    }

    await Department.create({ ...dept, status: "Active" });
    console.log(`Created: ${dept.departmentName}`);
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});