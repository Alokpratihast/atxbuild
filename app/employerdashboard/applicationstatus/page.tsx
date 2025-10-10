"use client";
import { useState } from "react";
import DocumentDashboard, { DocumentItem } from "@/components/employerpages/uploaddocuments/DashboardStatus";

export default function EmployerDashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { name: "Company PAN", type: "PDF", status: "Pending", uploadedAt: "2025-10-08" },
    { name: "Certificate of Incorporation", type: "PDF", status: "Approved", uploadedAt: "2025-10-07" },
  ]);

  const handleDelete = (indexOrId: string | number) => {
    setDocuments(prev => {
      if (typeof indexOrId === "number") {
        // remove by array index
        return prev.filter((_, i) => i !== indexOrId);
      } else {
        // remove by _id (for future API data)
        return prev.filter(doc => doc._id !== indexOrId);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <DocumentDashboard documents={documents} onDelete={handleDelete} />
    </div>
  );
}
