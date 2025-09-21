import mongoose, { Schema, model, models } from "mongoose";

export interface IHRPolicy {
  _id?: string;
  title: string;
  content: string; // Can store HTML or Markdown
  createdAt?: Date;
  updatedAt?: Date;
}

const HRPolicySchema = new Schema<IHRPolicy>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const HRPolicy = models.HRPolicy || model<IHRPolicy>("HRPolicy", HRPolicySchema);
export default HRPolicy;
