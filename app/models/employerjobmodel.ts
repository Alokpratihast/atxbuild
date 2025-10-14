import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  company: string;
  salaryMin?: number;
  salaryMax?: number;
  totalExperience?: number;
  skills: string[];
  availability: "Immediate" | "15 Days" | "1 Month" | "2 Months" | "Flexible";
  deadline: Date;
  status: "pending" | "approved" | "rejected";
  createdBy: mongoose.Schema.Types.ObjectId; // Admin who created
  isActive: boolean;
}

const JobSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, "Job title is required"], 
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    company: { 
      type: String, 
      required: [true, "Company name is required"], 
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"]
    },
    description: { 
      type: String, 
      required: [true, "Job description is required"], 
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    location: { 
      type: String, 
      required: [true, "Location is required"], 
      trim: true 
    },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    totalExperience: { type: Number, min: 0 },
    skills: { 
      type: [String], 
      required: [true, "At least one skill is required"], 
      trim: true 
    },
    availability: {
      type: String,
      enum: ["Immediate", "15 Days", "1 Month", "2 Months", "Flexible"],
      default: "Flexible",
    },
    deadline: { 
      type: Date, 
      required: [true, "Application deadline is required"] 
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employer", // reference to employer model
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.employerJob || mongoose.model<IJob>("employerJob", JobSchema);

