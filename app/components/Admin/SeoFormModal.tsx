// components/Admin/SeoFormModal.tsx
"use client";

import { FC, useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { z, ZodError } from "zod";

// 1️⃣ Define the SEO form data type
export interface SEOFormData {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage: string;
  twitterCard: string;
  schema: string;
}

// 2️⃣ Props for the modal
interface SeoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<SEOFormData>;
  onSubmit: (data: SEOFormData) => void;
}

// 3️⃣ Zod validation schema
const seoSchema = z.object({
  page: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  schema: z.string().optional(),
});

const SeoFormModal: FC<SeoFormModalProps> = ({ isOpen, onClose, initialData, onSubmit }) => {
  // 4️⃣ Prefilled/default values for better UX
  const [formData, setFormData] = useState<SEOFormData>({
    page: "home",
    title: "Home Page - My Website",
    description: "This is the home page of my website. Add a description here.",
    keywords: ["home", "website", "seo"],
    canonical: "https://www.example.com/home",
    ogImage: "https://www.example.com/images/og-home.jpg",
    twitterCard: "https://www.example.com/images/twitter-home.jpg",
    schema: `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Home",
  "description": "Home page of my website"
}`,
  });

  // 5️⃣ Load initialData if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        keywords: initialData.keywords || formData.keywords,
      });
    }
  }, [initialData]);

  // 6️⃣ Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "keywords") setFormData({ ...formData, keywords: value.split(",") });
    else setFormData({ ...formData, [name]: value });
  };

  // 7️⃣ Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const validated = seoSchema.parse(formData);
      onSubmit({
        ...validated,
        keywords: validated.keywords || [],
        canonical: validated.canonical || "",
        ogImage: validated.ogImage || "",
        twitterCard: validated.twitterCard || "",
        schema: validated.schema || "",
      });
      onClose();
      toast.success("SEO Saved!");
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach((issue) => toast.error(issue.message));
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // 8️⃣ Hide modal if closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-900" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">{initialData ? "Edit SEO" : "Create SEO"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="page" value={formData.page} onChange={handleChange} placeholder="Page (e.g., home, about)" className="w-full border px-2 py-1 rounded" />
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title (e.g., Home Page - My Website)" className="w-full border px-2 py-1 rounded" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description (short SEO description)" className="w-full border px-2 py-1 rounded" />
          <input name="keywords" value={formData.keywords.join(",")} onChange={handleChange} placeholder="Keywords comma separated (e.g., home, website, seo)" className="w-full border px-2 py-1 rounded" />
          <input name="canonical" value={formData.canonical} onChange={handleChange} placeholder="Canonical URL (e.g., https://example.com/home)" className="w-full border px-2 py-1 rounded" />
          <input name="ogImage" value={formData.ogImage} onChange={handleChange} placeholder="OG Image URL" className="w-full border px-2 py-1 rounded" />
          <input name="twitterCard" value={formData.twitterCard} onChange={handleChange} placeholder="Twitter Card URL" className="w-full border px-2 py-1 rounded" />
          <textarea name="schema" value={formData.schema} onChange={handleChange} placeholder="Schema JSON" className="w-full border px-2 py-1 rounded" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">{initialData ? "Update SEO" : "Create SEO"}</button>
        </form>
      </div>
    </div>
  );
};

export default SeoFormModal;
