
'use client';

import { useState } from "react";
import { IOfferTemplate } from "@/models/OfferTemplate";
import { toast } from "react-hot-toast";

interface Props {
  template: IOfferTemplate;
  onClose: () => void;
}

export default function GenerateOffer({ template, onClose }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Extract all placeholders like {{candidateName}}, {{joiningDate}}, etc.
  const placeholders = Array.from(template.content.matchAll(/{{(.*?)}}/g)).map(
    ([_, k]) => k.trim()
  );

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    const missing = placeholders.filter(p => !formData[p]?.trim());
    if (missing.length) {
      toast.error(`Please fill all fields: ${missing.join(", ")}`);
      return;
    }

    // ✅ Validate joiningDate format (YYYY-MM-DD)
    if (formData.joiningDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.joiningDate)) {
      toast.error("Joining Date must be in YYYY-MM-DD format (e.g., 2025-10-06)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generateoffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template._id, ...formData }),
      });

      if (!res.ok) throw new Error("Generate failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.candidateName || "Offer"}-Offer.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Offer letter generated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate offer letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 overflow-auto p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 border border-gray-200 mt-10 mb-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Generate Offer: {template.role}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Dynamic Inputs */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {placeholders.map((key,index) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>

              {/* ✅ Dynamic input type based on placeholder */}
              <input
                type={key === "joiningDate" ? "date" : "text"}
                inputMode={key === "joiningDate" ? "numeric" : undefined}
                pattern={key === "joiningDate" ? "\\d*" : undefined}
                placeholder={key}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
