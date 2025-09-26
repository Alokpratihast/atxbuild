import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("Missing MongoDB URI");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach cache to the global object (so it survives hot reloads in Next.js)
const globalWithMongoose = global as typeof global & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectedToDatabase() {
  console.log("[DB] Checking cached connection...");

  if (cached.conn) {
    console.log("[DB] Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[DB] Creating new connection...");
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 20 })
      .then((mongoose) => {
        console.log("[DB] Connection established-2");
        return mongoose;
      })
      .catch((err) => {
        console.error("[DB] Connection error:", err);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;

  // ✅ Save back into global so Next.js hot reloads reuse it
  globalWithMongoose.mongoose = cached;

  console.log("[DB] Connection ready");
  return cached.conn;
}
