"use client";

import { useState, useEffect } from "react";
import CreateAdminForm from "@/components/Admin/multipleadmincreationform/adminform";

export default function AdminDashboard() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multipleadmin");
      const data = await res.json();
      if (res.ok) setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const res = await fetch(`/api/multipleadmin?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Create Admin Form */}
      <CreateAdminForm onSuccess={fetchAdmins} />

      {/* Admin List */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Admin List</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-center text-gray-500">No admins created yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {admins.map((admin) => (
              <li key={admin._id} className="flex justify-between items-center py-3 px-4 hover:bg-gray-50 rounded-md transition">
                <div>
                  <p className="font-medium text-gray-800">{admin.name}</p>
                  <p className="text-gray-500 text-sm">{admin.email}</p>
                  <p className="text-gray-500 text-sm">{admin.phone}</p>
                </div>
                <button
                  className="text-red-600 font-medium hover:text-red-800 transition"
                  onClick={() => handleDelete(admin._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
