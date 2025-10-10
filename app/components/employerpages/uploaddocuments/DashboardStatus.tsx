"use client";

import React, { useState, useEffect } from "react";

export interface DocumentItem {
  _id?: string; // optional, because demo array may not have it
  name: string;
  type: string;
  status: "Pending" | "Approved" | "Rejected";
  uploadedAt: string;
  url?: string; // optional for demo
}

export interface DocumentDashboardProps {
  documents: DocumentItem[];
  onDelete: (indexOrId: string | number) => void; // string for _id, number for index
}

export default function DocumentDashboard({ documents, onDelete }: DocumentDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (doc: DocumentItem, index: number) => {
    // Decide whether to send string (_id) or number (index)
    const idOrIndex = doc._id ?? index;
    setDeletingId(doc._id ?? null);
    onDelete(idOrIndex);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Uploaded Documents</h3>
      {documents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, index) => (
            <div
              key={doc._id ?? index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">Type: {doc.type}</p>
                <p className="text-xs text-gray-400 dark:text-gray-400">Uploaded: {doc.uploadedAt}</p>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">
                    View
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <button
                  onClick={() => handleDeleteClick(doc, index)}
                  disabled={deletingId === doc._id}
                  className={`text-red-600 dark:text-red-400 hover:underline text-xs ${deletingId === doc._id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {deletingId === doc._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
