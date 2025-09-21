"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import PolicyFormModal from "@/components/Admin/PolicyFormModal";

export interface Policy {
  _id?: string;
  title: string;
  content: string;
  createdAt?: string;
}

export default function PolicyDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // For viewing policy
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/policies");
      const data = await res.json();
      if (res.ok) {
        setPolicies(data.policies);
      } else {
        toast.error(data.error || "Failed to fetch policies");
      }
    } catch {
      toast.error("Something went wrong while fetching policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const deletePolicy = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/policies/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Policy deleted successfully");
        fetchPolicies();
      } else {
        toast.error(data.error || "Failed to delete policy");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Portal Policies</h1>
        <button
          onClick={() => {
            setEditingPolicy(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Policy
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-6">
                  No policies found
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr key={policy._id} className="border-t">
                  <td className="p-3">{policy.title}</td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setViewingPolicy(policy)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPolicy(policy);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={actionLoading === policy._id}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => deletePolicy(policy._id!)}
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading === policy._id}
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

      {/* Add/Edit Policy Modal */}
      {isModalOpen && (
        <PolicyFormModal
          editingPolicy={editingPolicy ?? undefined}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchPolicies}
        />
      )}

      {/* View Policy Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{viewingPolicy.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {viewingPolicy.content}
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
