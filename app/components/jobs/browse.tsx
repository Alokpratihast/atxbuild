"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ApplyModal from "@/components/jobs/ApplyModal";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  deadline: string;
  isActive: boolean;
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // 🧩 Fetch both admin + provider jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Fetch both APIs in parallel
        const [adminRes, providerRes] = await Promise.all([
          fetch("/api/jobs", { cache: "no-store" }),
          fetch("/api/employeeregister/employerjobs", { cache: "no-store" }),
        ]);

        const [adminData, providerData] = await Promise.all([
          adminRes.json(),
          providerRes.json(),
        ]);

        let combined: Job[] = [];

        if (adminData.success) {
          const activeAdminJobs = adminData.jobs.filter((j: Job) => j.isActive);
          combined = [...combined, ...activeAdminJobs];
        }

        if (providerData.success) {
          const activeProviderJobs = providerData.jobs.filter(
            (j: Job) => j.isActive
          );
          combined = [...combined, ...activeProviderJobs];
        }

        // Sort by latest deadline (or created date if needed)
        combined.sort(
          (a, b) =>
            new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        );

        setJobs(combined);
        setFilteredJobs(combined);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, jobs]);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-16">
      {/* 🔍 Search Bar */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center bg-white shadow rounded-lg px-4 py-2">
        <Search className="text-gray-400 w-5 h-5 mr-2" />
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 outline-none text-gray-700"
        />
      </div>

      {/* 🧱 Job Listings */}
      {loading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-gray-500">No jobs found.</p>
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentJobs.map((job) => (
            <motion.div
              key={job._id}
              layout
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
                <p className="mt-3 text-gray-600 line-clamp-3">{job.description}</p>
                <p className="mt-2 text-xs text-gray-400">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(job)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Now
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 💼 Apply Modal */}
      {selectedJob && (
        <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
