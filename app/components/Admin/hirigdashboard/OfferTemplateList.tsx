'use client';

import { useEffect, useState } from "react";
import { IOfferTemplate } from "@/models/OfferTemplate";
import { toast } from "react-hot-toast";

interface Props {
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: (template: IOfferTemplate) => void;
  onGenerate: (template: IOfferTemplate) => void;
}

export default function OfferTemplateList({ refresh, setRefresh, onEdit, onGenerate }: Props) {
  const [templates, setTemplates] = useState<IOfferTemplate[]>([]);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/offertemplates");
      const data = await res.json();
      if (data.success && data.data) setTemplates(data.data);
      else setTemplates([]);
    } catch (error) {
      toast.error("Failed to load templates");
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [refresh]);

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/offertemplates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Template deleted");
        setRefresh(prev => !prev);
      } else {
        toast.error(data.error || "Failed to delete template");
      }
    } catch {
      toast.error("Failed to delete template");
    }
  };

  if (templates.length === 0) {
    return <div className="text-center py-10 text-gray-500">No templates found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {templates.map((t, index) => (
        <div
          key={t._id ? t._id.toString() : index}
          className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-xl transition duration-300"
        >
          {/* Role & Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.role}</h3>
            <div
              className="text-gray-700 text-sm max-h-40 overflow-y-auto border border-gray-100 rounded p-2 whitespace-pre-line bg-gray-50"
              dangerouslySetInnerHTML={{ __html: t.content }}
            ></div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 flex-wrap justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              onClick={() => onEdit(t)}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
              onClick={() => onGenerate(t)}
            >
              Generate
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              onClick={() => handleDelete(t._id! as string)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
