import mongoose, { Schema, Document } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  email: string;
  slug: string;
  bio?: string;
  avatar?: string;
  role: "admin" | "editor" | "author";
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    bio: String,
    avatar: String,
    role: {
      type: String,
      enum: ["admin", "superadmin", "author"],
      default: "author",
    },
    social: {
      twitter: String,
      linkedin: String,
      github: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Author ||
  mongoose.model<IAuthor>("Author", AuthorSchema);
