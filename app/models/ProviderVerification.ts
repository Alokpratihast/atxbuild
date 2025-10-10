import mongoose, { Schema, Document } from "mongoose";

export interface IProviderVerification extends Document {
  providerType: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  companyName?: string;
  companyRegNumber?: string;
  companyWebsite?: string;
  companyEmail?: string;
  documents: Record<string, string | null>;
  status: string;
  createdAt: Date;
}

const ProviderVerificationSchema = new Schema<IProviderVerification>({
  providerType: { type: String, required: true },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: { type: String },
  companyName: { type: String },
  companyRegNumber: { type: String },
  companyWebsite: { type: String },
  companyEmail: { type: String },
  documents: { type: Object },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProviderVerification ||
  mongoose.model<IProviderVerification>("ProviderVerification", ProviderVerificationSchema);
