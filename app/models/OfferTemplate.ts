// models/OfferTemplate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOfferTemplate extends Document {
  role: string;
  content: string; // placeholders like {{candidateName}}, {{jobTitle}}
  createdAt: Date;
  updatedAt: Date;
}

const OfferTemplateSchema = new Schema<IOfferTemplate>(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.OfferTemplate ||
  mongoose.model<IOfferTemplate>("OfferTemplate", OfferTemplateSchema);
 