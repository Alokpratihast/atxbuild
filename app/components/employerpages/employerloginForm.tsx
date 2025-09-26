"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EmployerAuthForm() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false); // false = login, true = signup
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    location: "",
    contactNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Toggle between Login and Signup
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setMessage("");
    setFormData({
      companyName: "",
      industry: "",
      location: "",
      contactNumber: "",
      email: "",
      password: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegister) {
      // Sign Up
      try {
        const res = await fetch("/api/employeeregister/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage("✅ Signup successful! Switching to login...");
          
          setTimeout(() => {
            setIsRegister(false);
          }, 1500);
        } else {
          setMessage(`❌ ${data.error || "Something went wrong"}`);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Error submitting form.");
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      const res = await signIn("employer-login", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setMessage(`❌ ${res.error}`);
      } else {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => {
        }, 1000);
        router.push("/employerdashboard"); // redirect to dashboard
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isRegister ? "Employer Sign Up" : "Employer Login"}
        </h2>

        {message && (
          <p className="text-center mb-3 text-sm font-medium text-red-500">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Work Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition ${
              isRegister ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? (isRegister ? "Signing Up..." : "Logging in...") : isRegister ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={toggleMode} className="text-blue-600 cursor-pointer font-medium">
            {isRegister ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
