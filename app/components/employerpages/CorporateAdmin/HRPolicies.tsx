'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Policy {
  _id?: string;
  title: string;
  content: string; // ✅ match backend field
}

export default function HRPoliciesView() {
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Fetch policies uploaded by admin
  const fetchPolicies = async () => {
    try {
      const res = await fetch("/api/corporatepage/hrpolicies"); // ✅ spelling fixed
      const data = await res.json();
      if (data.success) {
        setPolicies(data.data);
      } else {
        toast.error(data.error || "Failed to fetch policies");
      }
    } catch {
      toast.error("Failed to fetch policies");
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">HR Policies</h2>

      {policies.length === 0 ? (
        <p className="text-gray-500">No policies uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {policies.map((p) => (
            <li
              key={p._id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <span>{p.title}</span>
              <a
                href={p.content} // ✅ use "content" as the URL
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
