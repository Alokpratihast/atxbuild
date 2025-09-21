// models/Employer.ts
import mongoose from "mongoose";

const EmployerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    role: { type: String, default: "employer" }, // differentiate from jobseeker

    // ✅ New field to store uploaded documents
    documents: [
      {
        name: { type: String, required: true }, // original file name
        url: { type: String, required: true },  // ImageKit URL
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // ✅ createdAt & updatedAt
);

export default mongoose.models.Employer ||
  mongoose.model("Employer", EmployerSchema);
