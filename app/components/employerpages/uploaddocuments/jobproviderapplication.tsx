"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

type ProviderType = "company" | "individual";

// Validation schema
const FormSchema = z.object({
  providerType: z.enum(["company", "individual"]),
  contactName: z.string().min(3, "Name must be at least 3 characters"),
  contactEmail: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof FormSchema> & {
  companyRegDoc?: FileList;
  gstOrPan?: FileList;
  addressProof?: FileList;
  authorizedPersonId?: FileList;
  experienceLetter?: FileList;
};

// Allowed file types and max size
const FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE_MB = 5;

export default function JobProviderVerificationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { providerType: "company" },
  });

  const providerType = watch("providerType");

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    companyRegDoc: null,
    gstOrPan: null,
    addressProof: null,
    authorizedPersonId: null,
    experienceLetter: null,
  });

  const [loading, setLoading] = useState(false);

  // Autofill email from session and make it read-only
  useEffect(() => {
    if (session?.user?.email) {
      setValue("contactEmail", session.user.email);
    }
  }, [session, setValue]);

  const handleFileChange = (key: string, files: FileList | null) => {
    if (!files || !files[0]) return;

    const file = files[0];

    // Validate file type
    if (!FILE_TYPES.includes(file.type)) {
      toast.error(`Invalid file type for ${key}. Only PDF, PNG, JPG allowed`);
      return;
    }

    // Validate file size
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      toast.error(`${key} exceeds ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [key]: file }));
  };

  const onSubmit = async (data: FormValues) => {
    if (providerType === "company" && !uploadedFiles.companyRegDoc) {
      toast.error("Company registration document is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("providerType", data.providerType);
      formData.append("contactName", data.contactName);
      formData.append("contactEmail", data.contactEmail); // auto-filled

      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const res = await fetch("/api/upload-documents", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Upload failed");

      toast.success("Application submitted successfully!");
      reset();
      setUploadedFiles({
        companyRegDoc: null,
        gstOrPan: null,
        addressProof: null,
        authorizedPersonId: null,
        experienceLetter: null,
      });
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Job Provider Verification</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        {/* Provider Type */}
        <div className="flex gap-6 items-center">
          <label className="flex items-center gap-2">
            <input type="radio" value="company" {...register("providerType")} defaultChecked className="accent-blue-600" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Company</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="individual" {...register("providerType")} className="accent-blue-600" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Individual</span>
          </label>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Full Name"
              {...register("contactName")}
              className="border p-3 rounded-lg text-gray-700 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.contactName && <span className="text-red-500 text-sm mt-1">{errors.contactName.message}</span>}
          </div>
          <div className="flex flex-col">
            <input
              type="email"
              placeholder="Contact Email"
              {...register("contactEmail")}
              readOnly
              className="border p-3 rounded-lg text-gray-700 dark:text-gray-100 bg-gray-200 dark:bg-gray-600 focus:outline-none cursor-not-allowed"
            />
            {errors.contactEmail && <span className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</span>}
          </div>
        </div>

        {/* File Uploads */}
        {["companyRegDoc", "gstOrPan", "addressProof", "authorizedPersonId", "experienceLetter"].map(key => (
          <label
            key={key}
            className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <FiUpload className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{uploadedFiles[key]?.name || `Upload ${key}`}</span>
            </div>
            <input type="file" className="hidden" onChange={e => handleFileChange(key, e.target.files)} />
          </label>
        ))}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg shadow transition-colors"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
          <button
            type="button"
            onClick={() => { reset(); setUploadedFiles({ companyRegDoc: null, gstOrPan: null, addressProof: null, authorizedPersonId: null, experienceLetter: null }); }}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
