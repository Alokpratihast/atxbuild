import mongoose from "mongoose";

const SOPSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ["SOP", "Training", "Resource"], required: true },
  fileUrl: { type: String, required: true }, // e.g., PDF or DOCX link
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SOP || mongoose.model("SOP", SOPSchema);
