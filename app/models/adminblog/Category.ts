import mongoose, { Schema, Document, models } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default models.Category || mongoose.model<ICategory>("Category", CategorySchema);
