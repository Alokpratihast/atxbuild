import mongoose, { Schema, model, models } from "mongoose";

const TokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "jobseeker", required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Token || model("Token", TokenSchema);
