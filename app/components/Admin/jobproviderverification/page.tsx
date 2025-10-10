"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VerificationDoc {
  _id: string;
  contactName: string;
  contactEmail: string;
  providerType: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminVerificationPage() {
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all provider submissions
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

  // Handle approve/reject
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/adminjobs/jobproviderstatus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setDocs((prev) =>
        prev.map((doc) =>
          doc._id === id ? { ...doc, status: status as any } : doc
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Admin Dashboard — Provider Verification
      </h2>

      {docs.length === 0 ? (
        <p className="text-gray-500">No verification requests found.</p>
      ) : (
        <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Provider</th>
              <th className="p-3 text-left text-sm font-semibold">Email</th>
              <th className="p-3 text-left text-sm font-semibold">Type</th>
              <th className="p-3 text-left text-sm font-semibold">Status</th>
              <th className="p-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc._id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3 text-sm">{doc.contactName}</td>
                <td className="p-3 text-sm">{doc.contactEmail}</td>
                <td className="p-3 text-sm capitalize">{doc.providerType}</td>
                <td
                  className={`p-3 text-sm font-semibold capitalize ${
                    doc.status === "approved"
                      ? "text-green-600"
                      : doc.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {doc.status}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleStatusChange(doc._id, "approved")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(doc._id, "rejected")}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}
