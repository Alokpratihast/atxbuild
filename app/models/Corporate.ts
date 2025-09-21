import mongoose from "mongoose";

const CorporateSchema = new mongoose.Schema(
  {
    holidayCalendar: [
      {
        date: Date,
        occasion: String,
      },
    ],
    hrPolicies: [{ title: String, url: String }], // file links or text
    trainingMaterials: [{ title: String, url: String }],
    forms: [{ title: String, url: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Corporate ||
  mongoose.model("Corporate", CorporateSchema);
