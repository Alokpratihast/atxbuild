// app/lib/loadEnv.ts
import dotenv from "dotenv";
import path from "path";

// ✅ Always load from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("✅ ENV Loaded:", process.env.MONGODB_URI ? "Found MONGODB_URI" : "❌ Missing MONGODB_URI");
