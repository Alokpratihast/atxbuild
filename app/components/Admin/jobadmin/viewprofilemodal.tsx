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

        if (application && onUpdate) {
          onUpdate({ ...application, status });
        }
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">Applicant Profile</h2>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Name:</strong> {application.name}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Contact:</strong> {application.contactNumber}</p>
              <p><strong>Applied On:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
              <p><strong>Job Title:</strong> {application.jobId.title}</p>
              <p><strong>Company:</strong> {application.jobId.company}</p>

              <div>
                <label className="font-semibold">Application Status:</label>
                <select
                  value={application.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as Application["status"])
                  }
                  className={`ml-2 px-3 py-1 rounded ${statusColors[application.status]} focus:ring-2 focus:ring-blue-400 outline-none`}
                >
                  {Object.keys(statusColors).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Fixed resume viewer */}
              {application.resume && (
                <div>
                  <strong>Resume:</strong>{" "}
                  {(() => {
                    const resumeUrl = application.resume;
                    const isWordFile =
                      resumeUrl.endsWith(".doc") || resumeUrl.endsWith(".docx");

                    const viewUrl = isWordFile
                      ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(resumeUrl)}`
                      : resumeUrl;

                    return (
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View / Download
                      </a>
                    );
                  })()}
                </div>
              )}

              {application.coverLetter && (
                <div>
                  <strong>Cover Letter:</strong>
                  <p className="whitespace-pre-line bg-gray-50 p-2 rounded border border-gray-200">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              <button
                onClick={handleDelete}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
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
