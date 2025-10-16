import mongoose, { Schema, model, models, Document } from "mongoose";

// TypeScript Interface
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  seo?: mongoose.Schema.Types.ObjectId;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

// Blog Schema Definition
const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // Example: "nextjs-seo-setup"
    content: { type: String, required: true },
    excerpt: { type: String },
    coverImage: { type: String }, // for blog thumbnail / hero image
    category: { type: String },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "Admin", required: true },// can later reference user model
    seo: { type: Schema.Types.ObjectId, ref: "BlogSEO" }, // reference to SEO model
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt automatically
  }
);

// Export model safely (avoid recompilation issue in Next.js)
export default models.Blog || model<IBlog>("Blog", blogSchema);
