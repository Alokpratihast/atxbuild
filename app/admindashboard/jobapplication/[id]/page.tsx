"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
  };
  name: string;
  email: string;
  contactNumber: string;
  coverLetter?: string;
  resume?: string;
  status: "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: string;
}

const statusColors: Record<Application["status"], string> = {
  Pending: "bg-gray-200 text-gray-800",
  Interview: "bg-blue-500 text-white",
  Rejected: "bg-red-500 text-white",
  Accepted: "bg-green-500 text-white",
};


export default function ApplicantProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch single application
  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${id}`,{
         method: "GET",
         credentials: "include", // important
      });
      const data = await res.json();
      if (data.success) setApplication(data.application);
      else toast.error(data.error || "Failed to fetch application");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (status: Application["status"]) => {
    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        setApplication((prev) => (prev ? { ...prev, status } : prev));
        toast.success(`Status updated to ${status}`);
      } else toast.error(data.error || "Failed to update status");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Application deleted");
        router.push(`/admindashboard/jobapplication/[id]`);
      } else toast.error(data.error || "Failed to delete application");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete application");
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!application) return <p className="p-6 text-center text-red-500">Application not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800">Applicant Profile</h1>

      {/* Applicant Info */}
      <div className="border rounded-lg p-4 shadow bg-white space-y-3">
        <p><strong>Name:</strong> {application.name}</p>
        <p><strong>Email:</strong> {application.email}</p>
        <p><strong>Contact:</strong> {application.contactNumber}</p>
        <p>
          <strong>Applied On:</strong>{" "}
          {new Date(application.appliedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Job Info */}
      <div className="border rounded-lg p-4 shadow bg-white space-y-3">
        <p><strong>Job Title:</strong> {application.jobId.title}</p>
        <p><strong>Company:</strong> {application.jobId.company}</p>
      </div>

      {/* Status */}
      <div className="border rounded-lg p-4 shadow bg-white">
        <label className="block font-semibold mb-2">Application Status</label>
        <select
          value={application.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as Application["status"])
          }
          className={`px-3 py-2 rounded ${statusColors[application.status]}`}
        >
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Resume */}
      {application.resume && (
        <div className="border rounded-lg p-4 shadow bg-white">
          <h2 className="font-semibold mb-2">Resume</h2>
          <a
            href={application.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View / Download Resume
          </a>
        </div>
      )}

      {/* Cover Letter */}
      {application.coverLetter && (
        <div className="border rounded-lg p-4 shadow bg-white">
          <h2 className="font-semibold mb-2">Cover Letter</h2>
          <p className="whitespace-pre-line">{application.coverLetter}</p>
        </div>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Delete Application
      </button>
    </div>
  );
}
