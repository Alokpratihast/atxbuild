"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Seo {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
}

interface SeoFormModalProps {
  editingSeo?: Seo;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SeoFormModal({ editingSeo, onClose, onSuccess }: SeoFormModalProps) {
  const [formData, setFormData] = useState({ page: "", title: "", description: "", keywords: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSeo) {
      setFormData({
        page: editingSeo.page,
        title: editingSeo.title,
        description: editingSeo.description,
        keywords: editingSeo.keywords.join(", "),
      });
    }
  }, [editingSeo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingSeo ? "PATCH" : "POST";
      const url = editingSeo ? `/api/seo/${editingSeo._id}` : "/api/seo";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(",").map((k) => k.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`SEO ${editingSeo ? "updated" : "created"} successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to save SEO");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{editingSeo ? "Edit SEO" : "Add SEO"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="page"
            value={formData.page}
            onChange={handleChange}
            placeholder="Page (e.g. home, about, policies)"
            className="w-full border rounded p-2"
            required
          />
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Meta Title"
            className="w-full border rounded p-2"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Meta Description"
            className="w-full border rounded p-2 h-24"
            required
          />
          <input
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="Keywords (comma separated)"
            className="w-full border rounded p-2"
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : editingSeo ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
