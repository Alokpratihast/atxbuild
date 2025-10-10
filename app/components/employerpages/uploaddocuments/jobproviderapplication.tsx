"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

type ProviderType = "company" | "individual";

interface FormValues {
  providerType: ProviderType;
  companyName?: string;
  companyRegNumber?: string;
  companyWebsite?: string;
  companyEmail?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  companyRegDoc?: FileList;
  gstOrPan?: FileList;
  addressProof?: FileList;
  authorizedPersonId?: FileList;
  experienceLetter?: FileList;
}

interface JobProviderVerificationFormProps {
  onSuccess?: () => void; // callback to refresh dashboard
}

export default function JobProviderVerificationForm({ onSuccess }: JobProviderVerificationFormProps) {
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { providerType: "company" as ProviderType },
  });

  const providerType = watch("providerType");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  const initialFilesState: Record<string, File | null> = {
    companyRegDoc: null,
    gstOrPan: null,
    addressProof: null,
    authorizedPersonId: null,
    experienceLetter: null,
  };

  const [uploadedFiles, setUploadedFiles] = useState(initialFilesState);

  const handleFileChange = (key: string, files: FileList | null) => {
    if (files && files[0]) {
      setUploadedFiles(prev => ({ ...prev, [key]: files[0] }));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setMessage(null);
    setErrors(null);

    try {
      const formData = new FormData();
      formData.append("providerType", data.providerType);
      formData.append("contactName", data.contactName);
      formData.append("contactEmail", data.contactEmail);
      if (data.contactPhone) formData.append("contactPhone", data.contactPhone);
      if (data.address) formData.append("address", data.address);

      if (providerType === "company") {
        data.companyName && formData.append("companyName", data.companyName);
        data.companyRegNumber && formData.append("companyRegNumber", data.companyRegNumber);
        data.companyWebsite && formData.append("companyWebsite", data.companyWebsite);
        data.companyEmail && formData.append("companyEmail", data.companyEmail);
      }

      // Append all files to key "files"
      Object.values(uploadedFiles).forEach(file => {
        if (file) formData.append("files", file);
      });

      const res = await fetch("/api/employeeregister/upload-document", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Upload failed");

      setMessage("Your documents were submitted and are pending admin review.");
      reset();
      setUploadedFiles(initialFilesState);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      setErrors(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Provider Verification</h2>
      {message && <div className="text-green-600 dark:text-green-400 mb-2">{message}</div>}
      {errors && <div className="text-red-600 dark:text-red-400 mb-2">{errors}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Type */}
        <div className="md:col-span-2 flex gap-4 items-center mb-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="company" {...register("providerType")} defaultChecked />
            <span className="text-sm">Company</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="individual" {...register("providerType")} />
            <span className="text-sm">Individual Recruiter</span>
          </label>
        </div>

        {/* Company Fields */}
        {providerType === "company" && (
          <>
            <div className="md:col-span-2 flex flex-col gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <label>Company Name</label>
              <input type="text" {...register("companyName")} placeholder="Acme Pvt Ltd" className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <label>Registration Number</label>
              <input type="text" {...register("companyRegNumber")} placeholder="Enter registration number" className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2" />
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-600 hover:border-blue-500">
                <span>{uploadedFiles.companyRegDoc?.name || "Upload Certificate of Incorporation"}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileChange("companyRegDoc", e.target.files)} />
              </label>
            </div>

            {["gstOrPan", "addressProof", "authorizedPersonId"].map(key => (
              <label key={key} className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-blue-500">
                <span>{uploadedFiles[key]?.name || `Upload ${key}`}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileChange(key, e.target.files)} />
              </label>
            ))}
          </>
        )}

        {/* Individual Fields */}
        {providerType === "individual" && (
          <>
            <div className="md:col-span-2 flex flex-col gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <label>Full Name</label>
              <input type="text" {...register("contactName", { required: true })} className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            {["authorizedPersonId", "experienceLetter", "gstOrPan"].map(key => (
              <label key={key} className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-blue-500">
                <span>{uploadedFiles[key]?.name || `Upload ${key}`}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileChange(key, e.target.files)} />
              </label>
            ))}
          </>
        )}

        {/* Contact Fields */}
        {[
          { label: "Contact Person Name", name: "contactName", type: "text", required: true },
          { label: "Contact Email", name: "contactEmail", type: "email", required: true },
          { label: "Contact Phone (optional)", name: "contactPhone", type: "text", required: false },
          { label: "Address (optional)", name: "address", type: "text", required: false },
        ].map(field => (
          <div key={field.name} className="md:col-span-2 flex flex-col gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <label>{field.label}</label>
            <input type={field.type} {...register(field.name as any, { required: field.required })} className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        ))}

        {/* Submit */}
        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg shadow">
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
          <button type="button" onClick={() => { reset(); setMessage(null); setErrors(null); setUploadedFiles(initialFilesState); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
