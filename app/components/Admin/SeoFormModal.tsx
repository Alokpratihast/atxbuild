// components/Admin/SeoFormModal.tsx
"use client";

import { FC, useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { z, ZodError } from "zod";

export interface SEOFormData {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  twitterCard?: string;
  schema?: string;
}

interface SeoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<SEOFormData>;
  onSubmit: (data: SEOFormData) => void;
}

const seoSchema = z.object({
  page: z.string().min(1, "Page is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url("Invalid URL").optional(),
  ogImage: z.string().url("Invalid URL").optional(),
  twitterCard: z.string().url("Invalid URL").optional(),
  schema: z.string().optional(),
});

const SeoFormModal: FC<SeoFormModalProps> = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState<SEOFormData>({
    page: "",
    title: "",
    description: "",
    keywords: [],
    canonical: "",
    ogImage: "",
    twitterCard: "",
    schema: "",
  });

  // Load initialData if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        page: initialData.page || "",
        title: initialData.title || "",
        description: initialData.description || "",
        keywords: initialData.keywords || [],
        canonical: initialData.canonical || "",
        ogImage: initialData.ogImage || "",
        twitterCard: initialData.twitterCard || "",
        schema: initialData.schema || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "keywords") {
      setFormData({
        ...formData,
        keywords: value.split(",").map(k => k.trim()).filter(k => k),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const cleanData = {
      ...formData,
      canonical: formData.canonical?.trim() || undefined,
      ogImage: formData.ogImage?.trim() || undefined,
      twitterCard: formData.twitterCard?.trim() || undefined,
      schema: formData.schema?.trim() || undefined,
    };

    try {
      const validated = seoSchema.parse(cleanData);

      const dataToSubmit: SEOFormData = {
        page: validated.page,
        title: validated.title,
        description: validated.description,
        keywords: validated.keywords || [],
        ...(validated.canonical ? { canonical: validated.canonical } : {}),
        ...(validated.ogImage ? { ogImage: validated.ogImage } : {}),
        ...(validated.twitterCard ? { twitterCard: validated.twitterCard } : {}),
        ...(validated.schema ? { schema: validated.schema } : {}),
      };

      onSubmit(dataToSubmit);
      onClose();
      toast.success("SEO Saved!");
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach(issue => toast.error(issue.message));
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{initialData ? "Edit SEO" : "Create SEO"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="page"
            value={formData.page}
            onChange={handleChange}
            placeholder="Page (e.g., home, about)"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border px-2 py-1 rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="keywords"
            value={formData.keywords.join(",")}
            onChange={handleChange}
            placeholder="Keywords (comma separated)"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="canonical"
            value={formData.canonical || ""}
            onChange={handleChange}
            placeholder="Canonical URL"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="ogImage"
            value={formData.ogImage || ""}
            onChange={handleChange}
            placeholder="OG Image URL"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="twitterCard"
            value={formData.twitterCard || ""}
            onChange={handleChange}
            placeholder="Twitter Card URL"
            className="w-full border px-2 py-1 rounded"
          />
          <textarea
            name="schema"
            value={formData.schema || ""}
            onChange={handleChange}
            placeholder="Schema JSON"
            className="w-full border px-2 py-1 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            disabled={!formData.page || !formData.title || !formData.description}
          >
            {initialData ? "Update SEO" : "Create SEO"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SeoFormModal;
