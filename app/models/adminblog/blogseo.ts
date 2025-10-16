import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IBlogSEO extends Document {
  blog: mongoose.Types.ObjectId;
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  twitterCard?: string;
  structuredData?: any;
  robots?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSEOSchema = new Schema<IBlogSEO>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [String],
    canonical: String,
    ogImage: String,
    twitterCard: String,
    structuredData: Schema.Types.Mixed,
    robots: { type: String, default: "index,follow" },
  },
  { timestamps: true }
);

export default models.BlogSEO || model<IBlogSEO>("BlogSEO", BlogSEOSchema);
