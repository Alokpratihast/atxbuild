import mongoose, { Schema, Document } from "mongoose";

// Define allowed role types
export type AdminRole = "admin" | "superadmin";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "superadmin"], // ✅ strict role values
      default: "admin",              // ✅ fallback if not provided
    },
  },
  { timestamps: true }
);

export default mongoose.models.Admin ||
  mongoose.model<IAdmin>("Admin", AdminSchema);
