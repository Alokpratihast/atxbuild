"use client";

import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  jobId: { _id: string; title: string; company: string };
  name: string;
  email: string;
  contactNumber: string;
  coverLetter?: string;
  resume?: string;
  status: "Shortlisted" | "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: string;
}

export default function ShortlistedStudents() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch shortlisted applicants
  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adminjobs/fetchshortlisted");
      const data = await res.json();
      if (data.success) setApplications(data.applications);
      else setError(data.error || "Failed to fetch shortlisted applications");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch shortlisted applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  // Delete application
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) => prev.filter((app) => app._id !== id));
        toast.success("Application deleted");
      } else toast.error(data.error || "Failed to delete application");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!applications.length)
    return <p className="p-6 text-center">No shortlisted students found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Shortlisted Students</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-gray-300">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Job</th>
              <th className="px-3 py-2 text-left">Applied On</th>
              <th className="px-3 py-2 text-left">Documents</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">{app.name}</td>
                <td className="px-3 py-2">{app.email}</td>
                <td className="px-3 py-2">
                  {app.jobId?.title} - {app.jobId?.company}
                </td>
                <td className="px-3 py-2">
                  {new Date(app.appliedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 py-2 flex flex-col gap-1">
                  {app.resume && (
                    <a
                      href={app.resume}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      Resume
                    </a>
                  )}
                  {app.coverLetter && (
                    <a
                      href={app.coverLetter}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      Cover Letter
                    </a>
                  )}
                  {!app.resume && !app.coverLetter && <span className="text-gray-400 text-sm">N/A</span>}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button
                    onClick={() => router.push(`/admindashboard/jobapplication/${app._id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDelete(app._id)}
                    disabled={deletingId === app._id}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition disabled:opacity-50"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
