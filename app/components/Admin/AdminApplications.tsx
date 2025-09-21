"use client";

import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// -------------------------------
// Types
// -------------------------------
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
  status: "Pending" | "Interview" | "Rejected" | "Accepted" | "Shortlisted";
  appliedAt: string;
}

const statusColors: Record<Application["status"], string> = {
  Pending: "bg-gray-200 text-gray-800",
  Interview: "bg-blue-500 text-white",
  Rejected: "bg-red-500 text-white",
  Accepted: "bg-green-500 text-white",
  Shortlisted: "bg-green-700 text-white",
};

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Application["status"]>("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // -------------------------------
  // Fetch applications
  // -------------------------------
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adminjobs/fetchapplication");
      const data = await res.json();
      if (data.success) setApplications(data.applications);
      else setError(data.error || "Failed to fetch applications");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // -------------------------------
  // Update status
  // -------------------------------
  const handleStatusChange = async (id: string, status: Application["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/adminjobs/fetchapplication/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status } : app))
        );
        toast.success(`Status updated to ${status}`);
      } else toast.error(data.error || "Failed to update status");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // -------------------------------
  // Delete application
  // -------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
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
    }
  };

  const toggleJob = (jobId: string) =>
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!applications.length) return <p className="p-6 text-center">No applications found.</p>;

  // -------------------------------
  // Group by job
  // -------------------------------
  const jobsMap: Record<string, Application[]> = {};
  applications.forEach((app) => {
    const jobKey = app.jobId?._id || "Unknown Job";
    if (!jobsMap[jobKey]) jobsMap[jobKey] = [];
    jobsMap[jobKey].push(app);
  });

  // -------------------------------
  // Filter & Search
  // -------------------------------
  const filteredJobs = Object.entries(jobsMap).filter(([jobId, apps]) => {
    const job = apps[0];
    const jobMatches =
      job.jobId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.jobId?.company?.toLowerCase().includes(search.toLowerCase());
    const anyApplicantMatches = apps.some(
      (app) =>
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase())
    );
    const statusMatches = !statusFilter || apps.some((app) => app.status === statusFilter);
    return (jobMatches || anyApplicantMatches) && statusMatches;
  });

  // -------------------------------
  // Sort applicants
  // -------------------------------
  const sortApplicants = (apps: Application[]) =>
    [...apps].sort((a, b) =>
      sortBy === "date"
        ? new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        : a.name.localeCompare(b.name)
    );

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search jobs or applicants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as Application["status"] | "")
          }
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "name")}
          className="border rounded px-3 py-2"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Job Groups */}
      {filteredJobs.map(([jobId, apps]) => (
        <div key={jobId} className="mb-6 border rounded-lg shadow">
          {/* Job header */}
          <div
            className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer rounded-t-lg"
            onClick={() => toggleJob(jobId)}
          >
            <div>
              <strong className="text-gray-800">{apps[0].jobId?.title}</strong> -{" "}
              {apps[0].jobId?.company}{" "}
              <span className="text-sm text-gray-500">({apps.length} applicants)</span>
            </div>
            <button className="text-blue-600 font-medium">
              {expandedJobs[jobId] ? "Hide Applicants" : "View Applicants"}
            </button>
          </div>

          {/* Applicants Table */}
          {expandedJobs[jobId] && (
            <div className="overflow-x-auto">
              <table className="w-full border-t border-gray-300">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Applicant</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Applied On</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortApplicants(apps).map((app) => (
                    <tr
                      key={app._id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2">{app.name}</td>
                      <td className="px-3 py-2">{app.email}</td>

                      {/* Status Dropdown */}
                      <td className="px-3 py-2">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app._id, e.target.value as Application["status"])
                          }
                          disabled={updatingId === app._id}
                          className={`px-2 py-1 rounded text-sm ${statusColors[app.status]}`}
                        >
                          {Object.keys(statusColors).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-2">
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 flex gap-2">
                        <button
                          onClick={() => router.push(`/admindashboard/jobapplication/${app._id}`)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          View Profile
                        </button>

                        {app.status !== "Shortlisted" && (
                          <button
                            onClick={() => handleStatusChange(app._id, "Shortlisted")}
                            disabled={updatingId === app._id}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                          >
                            Shortlist
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(app._id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
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
          )}
        </div>
      ))}
    </div>
  );
}
