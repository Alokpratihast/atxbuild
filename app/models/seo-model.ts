import mongoose, { Schema, model, models } from "mongoose";

const seoSchema = new Schema({
  page: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], default: [] },
  canonical: { type: String },
  ogImage: { type: String },
  twitterCard: { type: String },
  schema: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.SEO || model("SEO", seoSchema);
