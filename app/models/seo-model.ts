import mongoose, { Schema, models, model } from "mongoose";

const seoSchema = new Schema(
  {
    page: { type: String, required: true, unique: true }, // e.g. "home", "about", "policies"
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Seo = models.Seo || model("Seo", seoSchema);
export default Seo;
