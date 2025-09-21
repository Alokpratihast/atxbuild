import mongoose, { Schema, model, models } from "mongoose";

const jobSeekerSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(), // auto-generate
    },

    // Basic Info
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
      password: { type: String, required: true },

    // Professional Details
    currentProfile: { type: String },
    totalExperience: { type: Number },
    relevantExperience: { type: Number },
    currentCTC: { type: Number },
    expectedCTC: { type: Number },
    workPreference: { type: String, enum: ["Remote", "Onsite", "Hybrid"] },
    noticePeriod: { type: Number },

    // Skills
    skills: [
      {
        name: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],

    // Work Experience
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: Number }, // months/years
      },
    ],

    // File Uploads
    resume: { type: String }, // store file path or URL
    coverLetter: { type: String },
  },
  { timestamps: true }
);

const JobSeeker = models.JobSeeker || model("JobSeeker", jobSeekerSchema);
export default JobSeeker;
