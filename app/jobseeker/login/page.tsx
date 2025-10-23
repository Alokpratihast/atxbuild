"use client";

import { useState } from "react";
import { useForm, FieldError } from "react-hook-form";
import { useRouter } from "next/navigation";

interface LoginForm {
  email: string;
  password: string;
}

export default function JobSeekerLoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);

  // Helper to safely extract error message
  const getErrorMessage = (error?: FieldError | string) => {
    if (!error) return "";
    if (typeof error === "string") return error;
    return error.message || "";
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/jobseeker-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        alert("Login successful!");
        router.push("/jobseekerdashboard");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">JobSeeker Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">
              {getErrorMessage(errors.email)}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {getErrorMessage(errors.password)}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

