"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/useAuthModal";
import { signIn } from "next-auth/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { closeModal } = useAuthModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col relative">
          <label className="mb-1 text-gray-600 font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />

          {/* Show eye icon only if user typed something */}
          {formData.password && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Submit */}
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
