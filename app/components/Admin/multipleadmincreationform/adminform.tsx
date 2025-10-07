"use client";

import { useState } from "react";

interface CreateAdminFormProps {
  onSuccess?: () => void;
}

export default function CreateAdminForm({ onSuccess }: CreateAdminFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    emailPrefix: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const DOMAIN = "@atxtechnologies.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "emailPrefix") {
      setFormData({ ...formData, emailPrefix: value.replace(DOMAIN, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const email = formData.emailPrefix + DOMAIN;

    if (!formData.name || !formData.emailPrefix || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/multipleadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create admin");
      } else {
        setSuccess("Admin created successfully!");
        setFormData({ name: "", emailPrefix: "", password: "", phone: "" });
        onSuccess?.(); // refresh admin list if callback exists
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
        Create Admin
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative">
          <input
            type="text"
            name="emailPrefix"
            placeholder="Email prefix"
            value={formData.emailPrefix}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-48"
          />
          <span className="absolute right-3 top-3 text-gray-500">{DOMAIN}</span>
        </div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="telephone"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
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
