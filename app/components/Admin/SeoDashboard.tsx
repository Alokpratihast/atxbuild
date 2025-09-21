"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SeoFormModal from "@/components/Admin/SeoFormModal";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Seo {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
}

export default function SeoDashboard() {
  const [seoList, setSeoList] = useState<Seo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<Seo | null>(null);

  const fetchSeo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seo");
      const data = await res.json();
      if (res.ok) setSeoList(data.seo);
      else toast.error(data.error || "Failed to fetch SEO data");
    } catch {
      toast.error("Something went wrong while fetching SEO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const deleteSeo = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/seo/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("SEO entry deleted successfully");
        fetchSeo();
      } else toast.error(data.error || "Failed to delete SEO entry");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SEO Metadata Management</h1>
        <button
          onClick={() => {
            setEditingSeo(null);
            setIsModalOpen(true); // ✅ open modal
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add SEO
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Page</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Keywords</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-6">Loading...</td>
              </tr>
            ) : seoList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6">No SEO entries found</td>
              </tr>
            ) : (
              seoList.map((seo) => (
                <tr key={seo._id} className="border-t">
                  <td className="p-3">{seo.page}</td>
                  <td className="p-3">{seo.title}</td>
                  <td className="p-3">{seo.description}</td>
                  <td className="p-3">{seo.keywords.join(", ")}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSeo(seo);
                        setIsModalOpen(true); // ✅ open modal for editing
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={actionLoading === seo._id}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => deleteSeo(seo._id!)}
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading === seo._id}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SeoFormModal
          editingSeo={editingSeo ?? undefined}
          onClose={() => setIsModalOpen(false)} // ✅ close modal
          onSuccess={fetchSeo}
        />
      )}
    </div>
  );
}
