"use client";

import { useState, useEffect } from "react";
import SeoFormModal, { SEOFormData } from "@/components/Admin/SeoFormModal";
import { toast } from "react-hot-toast";

const SeoDashboard = () => {
  const [seoList, setSeoList] = useState<SEOFormData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSEO, setEditingSEO] = useState<SEOFormData | null>(null);

  // 1️⃣ Fetch all SEO entries
  const fetchSEO = async () => {
    try {
      const res = await fetch("/api/seo");
      const data = await res.json();
      setSeoList(data);
    } catch (err: any) {
      toast.error("Failed to fetch SEO data");
    }
  };

  useEffect(() => { fetchSEO(); }, []);

  // 2️⃣ Handle create or update
  const handleCreateOrUpdate = async (data: SEOFormData) => {
    try {
      const res = editingSEO
        ? await fetch(`/api/seo/${editingSEO._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/seo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error saving SEO");

      toast.success(editingSEO ? "SEO Updated!" : "SEO Created!");
      setModalOpen(false);
      setEditingSEO(null);
      fetchSEO();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 3️⃣ Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO entry?")) return;
    try {
      const res = await fetch(`/api/seo/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete SEO");
      toast.success("Deleted successfully!");
      fetchSEO();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SEO Management Dashboard</h1>

      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setModalOpen(true)}
      >
        Add SEO
      </button>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Page</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {seoList.map((seo) => (
            <tr key={seo._id}>
              <td className="border p-2">{seo.page}</td>
              <td className="border p-2">{seo.title}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => { setEditingSEO(seo); setModalOpen(true); }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(seo._id!)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {seoList.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-4">
                No SEO entries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 4️⃣ SEO Form Modal */}
      <SeoFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSEO(null); }}
        initialData={editingSEO || undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default SeoDashboard;
