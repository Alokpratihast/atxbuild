"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token || !id) return;
      try {
        const res = await fetch("/api/auth/verifyresettoken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId: id }),
        });

        const data = await res.json();
        console.log("Verify token response:", data);

        if (data.success) setValidLink(true);
        else setMessage("❌ Invalid or expired reset link.");
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to verify link.");
      }
    }

    verifyToken();
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Password reset successful! Redirecting...");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setMessage("❌ " + (data.message || "Something went wrong."));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !id) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 text-lg">
        Invalid or missing token.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-5">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Reset Password
        </h1>

        {!validLink ? (
          <p className="text-center text-red-500">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {message && (
              <p
                className={`text-center text-sm mt-2 ${
                  message.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
