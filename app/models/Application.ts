import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// TypeScript interface for type safety
export interface IApplication extends Document {
  jobId: Types.ObjectId;
  title: string;
  company: string;
  userId: Types.ObjectId; // Use Types.ObjectId for correct Mongoose typing
  name: string;
  email: string;
  contactNumber?: string;
  resume?: string;
  coverLetter?: string;
  status: "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  shortlisted: boolean;
}


const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    title: { type: String, required: true },   // Job title
    company: { type: String, required: true }, // Company name
    userId: { type: Schema.Types.ObjectId, ref: "JobSeeker", required: true }, // Fixed typing
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, default: "" },
    resume: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
     shortlisted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Interview", "Rejected", "Accepted"],
      default: "Pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // createdAt & updatedAt automatically
  }
);

// Add static method to fetch applications by userId (optional convenience)
ApplicationSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ userId }).sort({ appliedAt: -1 });
};

const Application = models.Application || model<IApplication>("Application", ApplicationSchema);

export default Application;
