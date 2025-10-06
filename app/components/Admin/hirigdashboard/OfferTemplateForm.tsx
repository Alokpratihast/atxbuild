'use client';

import { useState } from "react";
import { IOfferTemplate } from "@/models/OfferTemplate";
import { toast } from "react-hot-toast";

interface Props {
  template: IOfferTemplate;
  onClose: () => void;
  onSaved: () => void;
}

export default function OfferTemplateForm({ template, onClose, onSaved }: Props) {
  const [role, setRole] = useState(template.role);
  const [content, setContent] = useState(template.content);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role.trim() || !content.trim()) {
      toast.error("Role and content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const method = template._id ? "PATCH" : "POST";
      const url = template._id
        ? `/api/offertemplates/${template._id}`
        : "/api/offertemplates";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Template ${template._id ? "updated" : "created"} successfully`);
        onSaved();
        onClose();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg space-y-4">
        <h2 className="text-xl font-bold">{template._id ? "Edit" : "Add"} Template</h2>
        <input
          type="text"
          placeholder="Role"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <textarea
          placeholder="Content with placeholders e.g., {{candidateName}}"
          className="w-full border px-3 py-2 rounded h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            onClick={handleSubmit}
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
