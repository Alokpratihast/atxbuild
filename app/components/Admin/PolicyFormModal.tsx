"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Policy {
  _id?: string;
  title: string;
  content: string;
}

interface PolicyFormModalProps {
  editingPolicy?: Policy;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PolicyFormModal({
  editingPolicy,
  onClose,
  onSuccess,
}: PolicyFormModalProps) {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingPolicy) {
      setFormData({
        title: editingPolicy.title,
        content: editingPolicy.content,
      });
    } else {
      setFormData({ title: "", content: "" }); // reset when adding new
    }
  }, [editingPolicy]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingPolicy ? "PATCH" : "POST";
      const url = editingPolicy
        ? `/api/policies/${editingPolicy._id}`
        : "/api/policies";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save policy");
      }

      toast.success(
        `Policy ${editingPolicy ? "updated" : "created"} successfully!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Policy save error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingPolicy ? "Edit Policy" : "Add Policy"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Policy Title"
            className="w-full border rounded p-2"
            required
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Policy Content"
            className="w-full border rounded p-2 h-40"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading
                ? "Saving..."
                : editingPolicy
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
