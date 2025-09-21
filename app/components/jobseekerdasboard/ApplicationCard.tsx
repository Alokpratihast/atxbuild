"use client";

import { useState } from "react";

interface ApplicationCardProps {
  _id: string; // application id for PATCH
  title: string;
  company: string;
  status: "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: string;
  isAdmin?: boolean; // only admin can change status
  onStatusUpdate?: (newStatus: string) => void; // callback to parent if needed
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Interview: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
  Accepted: "bg-green-100 text-green-700",
};

const statusOptions = ["Pending", "Interview", "Rejected", "Accepted"];

export default function ApplicationCard({
  _id,
  title,
  company,
  status,
  appliedAt,
  isAdmin = false,
  onStatusUpdate,
}: ApplicationCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "Pending" | "Interview" | "Rejected" | "Accepted";
    setUpdating(true);
    try {
      const res = await fetch(`/api/applications/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentStatus(newStatus);
        onStatusUpdate?.(newStatus); // optional callback to parent
      } else {
        console.error("Failed to update status:", data.error);
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Something went wrong while updating status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-lg transition">
      {/* Job info */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm">{company}</p>
        <p className="text-gray-400 text-sm">
          Applied on{" "}
          {new Date(appliedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Status badge / dropdown */}
      <div className="mt-4 md:mt-0">
        {isAdmin ? (
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            disabled={updating}
            className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
              statusColors[currentStatus]
            }`}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[currentStatus]}`}>
            {currentStatus}
          </span>
        )}
      </div>
    </div>
  );
}
