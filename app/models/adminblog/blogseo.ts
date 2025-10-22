import mongoose, { Schema, Document, model, models } from "mongoose";
import DOMPurify from "isomorphic-dompurify"; // for safe meta sanitization

// --------------------------------------------
// Interface Definition
// --------------------------------------------
export interface IBlogSEO extends Document {
  blog: mongoose.Types.ObjectId;
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  twitterCard?: string;
  structuredData?: Record<string, any>;
  robots?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------
// Schema Definition
// --------------------------------------------
const BlogSEOSchema = new Schema<IBlogSEO>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    keywords: { type: [String], default: [], index: true },
    canonical: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    twitterCard: { type: String, trim: true },
    structuredData: { type: Schema.Types.Mixed },
    robots: { type: String, default: "index,follow", trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// --------------------------------------------
// Middleware: Sanitize text fields
// --------------------------------------------
BlogSEOSchema.pre("save", function (next) {
  if (this.isModified("title")) this.title = DOMPurify.sanitize(this.title);
  if (this.isModified("description")) this.description = DOMPurify.sanitize(this.description);
  if (this.isModified("canonical") && this.canonical)
    this.canonical = DOMPurify.sanitize(this.canonical);
  next();
});

// --------------------------------------------
// Indexing for performance
// // --------------------------------------------
// BlogSEOSchema.index({ title: 1 });
// BlogSEOSchema.index({ blog: 1 });

// --------------------------------------------
// Safe Export
// --------------------------------------------
const BlogSEO = models.BlogSEO || model<IBlogSEO>("BlogSEO", BlogSEOSchema);
export default BlogSEO;
