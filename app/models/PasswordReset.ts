import mongoose, { Schema, model, models } from "mongoose";

const PasswordResetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "jobseeker" },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  requestIp: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default models.PasswordReset || model("PasswordReset", PasswordResetSchema);
