"use client";

import SignUpForm from "@/components/Menupages/SignUpForm";

export default function Register() {
  return (
    <div className="flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <SignUpForm />
      </div>
    </div>
  );
}
