

"use client";




import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationDoc {
  _id: string;
  contactName: string;
  contactEmail: string;
  providerType: string;
  status: VerificationStatus;
  createdAt: string;
  documents: Record<string, string | null>;
}

const PAGE_SIZE = 5;

export default function AdminVerificationPage() {
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/upload-documents");
        if (!res.ok) throw new Error("Failed to load documents");
        const data = await res.json();
        setDocs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleStatusChange = async (id: string, status: VerificationStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/adminjobs/jobproviderstatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setDocs((prev) => prev.map((doc) => (doc._id === id ? { ...doc, status } : doc)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/adminjobs/delete-document/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      setDocs((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  // Filter and search
  const filteredDocs = docs
    .filter((doc) =>
      (statusFilter === "all" || doc.status === statusFilter) &&
      (typeFilter === "all" || doc.providerType === typeFilter) &&
      (doc.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       doc.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading)
    return <p className="text-center text-gray-500 mt-20 animate-pulse">Loading documents...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-20 font-medium">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Admin Dashboard — Provider Verification
      </h2>

      {/* Filters + Search */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as VerificationStatus | "all"); setCurrentPage(1); }}
          className="border rounded p-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="border rounded p-2"
        >
          <option value="all">All Types</option>
          <option value="company">Company</option>
          <option value="individual">Individual</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="border rounded p-2 flex-1 min-w-[200px]"
        />
      </div>

      {paginatedDocs.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No verification requests found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Provider</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Files</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDocs.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{doc.contactName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{doc.contactEmail}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-700 dark:text-gray-200">{doc.providerType}</td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    {Object.entries(doc.documents).map(([key, url]) =>
                      url ? (
                        <button
                          key={key}
                          onClick={() => setPreviewDoc({ name: key, url })}
                          className="text-blue-500 hover:underline text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                        >
                          {key}
                        </button>
                      ) : null
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    <button
                      disabled={updatingId === doc._id}
                      onClick={() => handleStatusChange(doc._id, "approved")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      disabled={updatingId === doc._id}
                      onClick={() => handleStatusChange(doc._id, "rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                    <button
                      disabled={updatingId === doc._id}
                      onClick={() => handleDelete(doc._id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 font-bold text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2">{previewDoc.name}</h3>
            {previewDoc.url.endsWith(".pdf") ? (
              <iframe src={previewDoc.url} className="w-full h-[500px]" />
            ) : (
              <img src={previewDoc.url} alt={previewDoc.name} className="w-full h-auto rounded" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
