// One-time fix: the "departments" collection has a leftover unique
// index on a field called "name" from an earlier version of the
// Department schema (it's called "departmentName" now). Since no
// document actually has a "name" field, MongoDB treats every
// document as name: null, and a *second* department collides with
// the first ("duplicate key" error) even though their names are
// completely different.
//
// This drops that stale index. Safe to run more than once — if the
// index is already gone, it just logs that and exits.
//
// Run once from the backend folder:
//   node src/fixDepartmentIndex.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db.js";

const run = async () => {
  await connectDB();

  const collection = mongoose.connection.collection("departments");
  const indexes = await collection.indexes();

  console.log("Current indexes on 'departments':", indexes.map((i) => i.name));

  const staleIndex = indexes.find((i) => i.name === "name_1");

  if (staleIndex) {
    await collection.dropIndex("name_1");
    console.log("Dropped stale index: name_1");
  } else {
    console.log("No stale 'name_1' index found — nothing to do.");
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Fix failed:", err.message);
  process.exit(1);
});