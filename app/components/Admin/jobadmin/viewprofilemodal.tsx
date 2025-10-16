"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";

interface ApplicantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string | null;
  onUpdate?: (app: Application) => void;
  onDelete?: (id: string) => void;
}

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
  originalFileName?: string; // optional original filename
  status: "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: string;
}

const statusColors: Record<Application["status"], string> = {
  Pending: "bg-gray-200 text-gray-800",
  Interview: "bg-blue-500 text-white",
  Rejected: "bg-red-500 text-white",
  Accepted: "bg-green-500 text-white",
};

export default function ApplicantProfileModal({
  isOpen,
  onClose,
  applicantId,
  onUpdate,
  onDelete,
}: ApplicantProfileModalProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicantId || !isOpen) return;

    const fetchApplication = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/adminjobs/fetchapplication/${applicantId}`, {
          credentials: "include",
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

    fetchApplication();
  }, [applicantId, isOpen]);

  const handleStatusChange = async (status: Application["status"]) => {
    if (!applicantId) return;
    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setApplication((prev) => (prev ? { ...prev, status } : prev));
        toast.success(`Status updated to ${status}`);
        if (application && onUpdate) onUpdate({ ...application, status });
      } else toast.error(data.error || "Failed to update status");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!applicantId || !confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${applicantId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Application deleted");
        if (onDelete) onDelete(applicantId);
        onClose();
      } else toast.error(data.error || "Failed to delete application");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete application");
    }
  };

  if (!isOpen) return null;

  // ================= Resume Helpers =================
  const getResumeDownloadUrl = (resume: string) => {
    if (resume.startsWith("/uploads/") && process.env.NEXT_PUBLIC_BASE_URL) {
      return `${process.env.NEXT_PUBLIC_BASE_URL}${resume}`;
    }
    return resume; // ImageKit URLs
  };

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
  <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg relative shadow-lg border border-gray-200">
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-gray-500 hover:text-black"
    >
      <FiX size={20} />
    </button>

    {loading ? (
      <p className="text-center p-4">Loading...</p>
    ) : !application ? (
      <p className="text-center text-red-500">Application not found.</p>
    ) : (
      <>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Applicant Profile</h2>

        {/* ---------------- Job Info Section ---------------- */}
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-700">Job Information</h3>
          <p><strong>Job Title:</strong> {application.jobId.title}</p>
          <p><strong>Company:</strong> {application.jobId.company}</p>
          <p><strong>Applied On:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>

        {/* ---------------- Applicant Info Section ---------------- */}
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-700">Applicant Information</h3>
          <p><strong>Name:</strong> {application.name}</p>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Contact:</strong> {application.contactNumber}</p>
        </div>

        {/* ---------------- Status Section ---------------- */}
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-700">Application Status</h3>
          <select
            value={application.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as Application["status"])
            }
            className={`px-3 py-2 rounded ${statusColors[application.status]} focus:ring-2 focus:ring-blue-400 outline-none`}
          >
            {Object.keys(statusColors).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ---------------- Resume Section ---------------- */}
        {application.resume && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-semibold mb-2 text-gray-700">Resume</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <a
                href={getResumeDownloadUrl(application.resume)}
                download={application.originalFileName || "resume.pdf"}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all text-center"
              >
                Download
              </a>
              <a
                href={getResumeDownloadUrl(application.resume)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-center"
              >
                View
              </a>
            </div>
          </div>
        )}

        {/* ---------------- Cover Letter Section ---------------- */}
        {application.coverLetter && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-semibold mb-2 text-gray-700">Cover Letter</h3>
            <p className="whitespace-pre-line">{application.coverLetter}</p>
          </div>
        )}

        {/* ---------------- Delete Button ---------------- */}
        <div className="text-right">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
          >
            Delete Application
          </button>
        </div>
      </>
    )}
  </div>
</div>

  );
}
