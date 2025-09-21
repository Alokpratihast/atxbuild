"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/useAuthModal";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { closeModal } = useAuthModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation
    if (!formData.email || !formData.password) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("admin-login", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) setError("Invalid credentials");
      else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role !== "admin") {
          setError("Only admin can login here");
          return;
        }

        closeModal();
        router.push("/admindashboard");
      }
    } catch {
      setError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 sm:p-10">
      <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 font-medium">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
