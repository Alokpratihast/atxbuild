import mongoose, { Schema, model, models, Document } from "mongoose";
import DOMPurify from "isomorphic-dompurify"; // for HTML sanitization (if using rich text)

// --------------------------------------------
// TypeScript Interface
// --------------------------------------------
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  author: mongoose.Schema.Types.ObjectId; // reference to Admin model
  seo?: mongoose.Schema.Types.ObjectId;    // reference to BlogSEO model
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------
// Blog Schema Definition
// --------------------------------------------
const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    coverImage: { type: String },
    category: { type: String, trim: true },
    tags: { type: [String], default: [], index: true },
    author: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    seo: { type: Schema.Types.ObjectId, ref: "BlogSEO" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically handled
    versionKey: false, // removes __v
  }
);

// --------------------------------------------
// Indexes for performance optimization
// --------------------------------------------
// blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ title: "text", content: "text", tags: "text" }); // for full-text search

// --------------------------------------------
// Middleware: Slug normalization
// --------------------------------------------
blogSchema.pre("save", function (next) {
  if (this.isModified("slug")) {
    this.slug = this.slug.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// --------------------------------------------
// Middleware: Content sanitization
// --------------------------------------------
blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.content = DOMPurify.sanitize(this.content); // Prevent XSS
  }
  next();
});

// --------------------------------------------
// Safe model export (avoids re-compilation)
// --------------------------------------------
const Blog = models.Blog || model<IBlog>("Blog", blogSchema);
export default Blog;
