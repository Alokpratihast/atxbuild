"use client";

import { useState, useEffect } from "react";

// CreateAdminForm Component
function CreateAdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/multipleadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create admin");
      } else {
        setSuccess("Admin created successfully!");
        setFormData({ name: "", email: "", password: "" });
        onSuccess(); // refresh admin list
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Create Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}

// AdminDashboard Component
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
