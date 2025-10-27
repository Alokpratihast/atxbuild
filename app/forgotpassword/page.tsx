"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Password reset link sent to your email. Check inbox.");
      } else {
        setMessage("❌ " + (data.message || "Failed to send reset link."));
      }
    } catch (err) {
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-center text-sm">
          Enter your registered email, and we’ll send you a secure link to reset your password.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("❌")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
