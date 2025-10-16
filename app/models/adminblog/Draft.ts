import mongoose, { Schema, Document, models } from "mongoose";

export interface IDraft extends Document {
  blog: mongoose.Types.ObjectId;
  tempContent: string;
  lastEdited: Date;
}

const DraftSchema = new Schema<IDraft>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    tempContent: { type: String, required: true },
    lastEdited: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Draft || mongoose.model<IDraft>("Draft", DraftSchema);
