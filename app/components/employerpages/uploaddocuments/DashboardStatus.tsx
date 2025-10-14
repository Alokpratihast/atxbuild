"use client";

import { useEffect, useState } from "react";

interface DocumentItem {
  _id?: string;
  name: string;
  type: string;
  status: "Pending" | "Approved" | "Rejected";
  uploadedAt: string;
  url?: string;
}

export default function EmployerDashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch documents from backend
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/upload-documents"); // your GET API
      const data: DocumentItem[] = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Delete document (local + call API if exists)
  const handleDelete = async (doc: DocumentItem, index: number) => {
    setDeletingId(doc._id ?? null);
    try {
      if (doc._id) {
        await fetch(`/api/employeeregister/delete-document`, {
          method: "DELETE",
          body: JSON.stringify({ id: doc._id }),
          headers: { "Content-Type": "application/json" },
        });
      }
      setDocuments(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Uploaded Documents</h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <div
                key={doc._id ?? index}
                className="flex justify-between items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Type: {doc.type}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">Uploaded: {doc.uploadedAt}</p>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                  <button
                    onClick={() => handleDelete(doc, index)}
                    disabled={deletingId === doc._id}
                    className={`text-red-600 dark:text-red-400 hover:underline text-xs ${
                      deletingId === doc._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {deletingId === doc._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
