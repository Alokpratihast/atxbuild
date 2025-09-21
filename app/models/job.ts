// // models/job.ts
// import mongoose from "mongoose";

// const JobSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     company: { type: String, required: true },
//     location: { type: String, required: true },
//     description: { type: String, required: true },
//     salary: String,
//     employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"] },
//     postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" }, // employer user
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Job || mongoose.model("Job", JobSchema);
