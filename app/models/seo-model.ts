import mongoose, { Schema, model, models } from "mongoose";

const seoSchema = new Schema({
  page: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], default: [] }, // optional by default
  canonical: { type: String },               // optional
  ogImage: { type: String, required: false }, // explicitly optional
  twitterCard: { type: String, required: false }, // explicitly optional
  schema: { type: Object, required: false },      // explicitly optional
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Export the model
export default models.SEO || model("SEO", seoSchema);
