import mongoose, { Schema, Document, models } from "mongoose";

export interface IPolicy extends Document {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite upon hot-reload in Next.js
const Policy = models.Policy || mongoose.model<IPolicy>("Policy", PolicySchema);

export default Policy;
