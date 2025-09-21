"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import JobFormModal, { Job } from "@/components/Admin/JobFormModal";

export default function JobDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
  try {
    setLoading(true);
    const res = await fetch(
      `/api/adminjobs?search=${search}&filter=${filter}&page=${page}&limit=5&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      { method: "GET", credentials: "include" }
    );
    const data = await res.json();

    console.log("API response:", data);           // Log full API response
    if (res.ok) {
      console.log("Jobs fetched:", data.jobs);    // Log jobs array
      setJobs(data.jobs);
      setTotalPages(data.pagination.totalPages);
    } else {
      toast.error(data.error || "Failed to fetch jobs");
    }
  } catch (error) {
    console.error("Fetch error:", error);         // Log fetch error
    toast.error("Something went wrong while fetching jobs");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchJobs();
  }, [search, filter, page, sortBy, sortOrder]);

  // Delete job
  const deleteJob = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/adminjobs/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Job deleted successfully");
        fetchJobs();
      } else toast.error(data.error || "Failed to delete job");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle active/inactive
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/adminjobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Job ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchJobs();
      } else toast.error(data.error || "Failed to update job");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Update job status
  const updateStatus = async (id: string, status: Job["status"]) => {
    if (!status) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/adminjobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) fetchJobs();
      else toast.error(data.error || "Failed to update status");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Sorting helper
  const handleSort = (field: string) => {
    setSortBy(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Management</h1>
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title, company, location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-64"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Jobs</option>
          <option value="active">Active Jobs</option>
          <option value="inactive">Inactive Jobs</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th onClick={() => handleSort("title")} className="p-3 cursor-pointer">Title</th>
              <th onClick={() => handleSort("company")} className="p-3 cursor-pointer">Company</th>
              <th onClick={() => handleSort("location")} className="p-3 cursor-pointer">Location</th>
              <th onClick={() => handleSort("salaryMin")} className="p-3 cursor-pointer">Salary</th>
              <th onClick={() => handleSort("totalExperience")} className="p-3 cursor-pointer">Experience</th>
              <th>Status</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center p-6">Loading...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6">No jobs found</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id} className="border-t">
                  <td className="p-3">{job.title}</td>
                  <td className="p-3">{job.company}</td>
                  <td className="p-3">{job.location}</td>

                  {/* Fixed salary display */}
                  <td className="p-3">
                    {job.salaryMin != null && job.salaryMax != null
                      ? `${job.salaryMin} - ${job.salaryMax}`
                      : job.salaryMin != null
                      ? `${job.salaryMin}`
                      : job.salaryMax != null
                      ? `${job.salaryMax}`
                      : "N/A"}
                  </td>

                  {/* Fixed experience display */}
                  <td className="p-3">{job.totalExperience != null ? job.totalExperience : "N/A"}</td>

                  <td className="p-3">
                    <select
                      value={job.status}
                      disabled={actionLoading === job._id}
                      onChange={(e) =>
                        job._id && updateStatus(job._id, e.target.value as Job["status"])
                      }
                      className="border rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => job._id && toggleActive(job._id, job.isActive)}
                      disabled={actionLoading === job._id}
                      className={`px-3 py-1 rounded text-white ${
                        job.isActive
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {actionLoading === job._id
                        ? "..."
                        : job.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={actionLoading === job._id}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => job._id && deleteJob(job._id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading === job._id}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <JobFormModal
          editingJob={editingJob ?? undefined}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchJobs}
        />
      )}
    </div>
  );
}
