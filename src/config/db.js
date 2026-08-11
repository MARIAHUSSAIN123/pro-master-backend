import mongoose from "mongoose";

// Vercel serverless functions can reuse a "warm" instance across
// requests, but each cold start re-imports this module — caching the
// connection on `global` (not just a module-level variable) survives
// that and stops us from opening a fresh MongoDB connection on every
// single request, which would exhaust Atlas's connection limit fast.
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        // Vercel's Hobby plan kills a function after ~10 seconds.
        // Mongoose's default serverSelectionTimeoutMS is 30 seconds,
        // so a slow/cold Atlas connection would hang past Vercel's
        // limit with no response ever sent — the browser then reports
        // that as a CORS error, even though the real cause is this
        // timeout mismatch. Failing fast here (well under 10s) lets
        // the handler's catch block actually run and respond.
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000,
      })
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Failed:", error.message);
    // No process.exit here — on Vercel this file runs inside a shared
    // serverless runtime, and exiting the process would take down
    // more than just this one failed request. Local `server.js`
    // still exits on a failed connect (see its own catch).
    throw error;
  }

  return cached.conn;
};

export default connectDB;
