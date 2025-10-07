"use client";

import { useRouter } from "next/navigation";

export default function ChooseRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Registration form
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/jobseeker/signup")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
             Jobseeker
          </button>

          <button
            onClick={() => router.push("/employerlogin/employerloginform")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
             Employer
          </button>
        </div>
      </div>
    </div>
  );
}
