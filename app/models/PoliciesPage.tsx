"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Policy {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/policies");
      const data = await res.json();

      if (res.ok && data.success) {
        setPolicies(data.policies);
      } else {
        toast.error(data.error || "Failed to fetch policies");
      }
    } catch (err) {
      toast.error("Something went wrong while fetching policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Employee Portal Policies</h1>

      {loading ? (
        <p>Loading policies...</p>
      ) : policies.length === 0 ? (
        <p>No policies found.</p>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy._id} className="border rounded p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{policy.title}</h2>
              <p className="text-gray-700 whitespace-pre-line">{policy.content}</p>
              <p className="text-sm text-gray-400 mt-2">
                Created on: {new Date(policy.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
