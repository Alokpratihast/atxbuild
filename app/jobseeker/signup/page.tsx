"use client";

import { useRouter } from "next/navigation";
import JobSeekerSignupForm from "@/components/jobseeker/JobSeekerSignupForm";

export default function JobSeekerSignupPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">JobSeeker Signup</h1>
      <JobSeekerSignupForm  />
    </div>
  );
}
