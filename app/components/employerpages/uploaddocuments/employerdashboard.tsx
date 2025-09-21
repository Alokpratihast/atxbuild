"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

interface DocumentUploadForm {
  educationCert: FileList;
  govtId: FileList;
  experienceLetter: FileList;
}

export default function DocumentUpload() {
  const { register, handleSubmit, reset } = useForm<DocumentUploadForm>();
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<{ [key: string]: boolean }>({});

  const onSubmit = async (data: DocumentUploadForm) => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (data.educationCert?.[0]) {
        formData.append("educationCert", data.educationCert[0]);
      }
      if (data.govtId?.[0]) {
        formData.append("govtId", data.govtId[0]);
      }
      if (data.experienceLetter?.[0]) {
        formData.append("experienceLetter", data.experienceLetter[0]);
      }

      const res = await fetch("/api/upload-documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setUploaded({
        educationCert: !!data.educationCert?.[0],
        govtId: !!data.govtId?.[0],
        experienceLetter: !!data.experienceLetter?.[0],
      });

      reset();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        className="w-full max-w-3xl p-8 md:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Upload Your Documents
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Educational Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Educational Certificate
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register("educationCert")}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {uploaded.educationCert && (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm mt-2">
                <CheckCircle size={16} /> Uploaded successfully
              </p>
            )}
          </div>

          {/* Government-issued ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Government-issued ID
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register("govtId")}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {uploaded.govtId && (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm mt-2">
                <CheckCircle size={16} /> Uploaded successfully
              </p>
            )}
          </div>

          {/* Experience Letter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Letter
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register("experienceLetter")}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {uploaded.experienceLetter && (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm mt-2">
                <CheckCircle size={16} /> Uploaded successfully
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Documents
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
