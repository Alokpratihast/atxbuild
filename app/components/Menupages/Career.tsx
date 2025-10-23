


"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApplyModal from "../jobs/ApplyModal";
import Select from "react-select";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, Calendar, Briefcase } from "lucide-react";

interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  skills?: string[];
  totalExperience?: number;
  availability?: string;
  deadline?: string;
  isActive?: boolean;
  logo?: string;
}

export default function CareerPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [experienceQuery, setExperienceQuery] = useState(searchParams.get("exp") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("loc") || "");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    searchParams.get("companies")?.split(",") || []
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.get("skills")?.split(",") || []
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const jobsSectionRef = useRef<HTMLDivElement>(null);

  // ---------- FETCH JOBS ----------
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/jobs", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs || []);
          setFilteredJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ---------- DEBOUNCE ----------
  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ---------- FILTER JOBS ----------
  const filterJobs = () => {
    const query = searchQuery.toLowerCase();
    const exp = experienceQuery.toLowerCase();
    const loc = locationQuery.toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.skills?.some((skill) => skill.toLowerCase().includes(query));

      const matchesExp = exp ? job.totalExperience?.toString().includes(exp) : true;
      const matchesLoc = loc ? job.location?.toLowerCase().includes(loc) : true;
      const matchesCompanies =
        selectedCompanies.length > 0 ? selectedCompanies.includes(job.company) : true;
      const matchesSkills =
        selectedSkills.length > 0
          ? job.skills?.some((skill) => selectedSkills.includes(skill))
          : true;

      return matchesSearch && matchesExp && matchesLoc && matchesCompanies && matchesSkills;
    });

    setFilteredJobs(filtered);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (experienceQuery) params.set("exp", experienceQuery);
    if (locationQuery) params.set("loc", locationQuery);
    if (selectedCompanies.length > 0) params.set("companies", selectedCompanies.join(","));
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","));

    router.replace(`?${params.toString()}`);
  };

  const debouncedFilter = useMemo(
    () => debounce(filterJobs, 300),
    [jobs, searchQuery, experienceQuery, locationQuery, selectedCompanies, selectedSkills]
  );

  useEffect(() => {
    debouncedFilter();
  }, [jobs, searchQuery, experienceQuery, locationQuery, selectedCompanies, selectedSkills]);

  // ---------- APPLY ----------
  const handleApplyClick = (job: Job) => {
    if (!currentUser) {
      alert("Please login to apply for jobs.");
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
  };

  // ---------- UNIQUE FILTER OPTIONS ----------
  const uniqueCompanies = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.company))),
    [jobs]
  );
  const uniqueSkills = useMemo(
    () => Array.from(new Set(jobs.flatMap((job) => job.skills || []))),
    [jobs]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* ---------- HERO & FILTER BAR ---------- */}
      <section className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-800 dark:text-white mb-6">
          Find Your <span className="text-blue-600">Dream Job</span>
        </h1>
      </section>

      <section className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md py-6 px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search roles, companies, skills"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <Input
              placeholder="Experience (years)"
              value={experienceQuery}
              onChange={(e) => setExperienceQuery(e.target.value)}
              className="rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <Input
              placeholder="Location"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 md:mt-0">
            <Select
              isMulti
              placeholder="Filter by Companies"
              options={uniqueCompanies.map((c) => ({ value: c, label: c }))}
              value={selectedCompanies.map((c) => ({ value: c, label: c }))}
              onChange={(selected) => setSelectedCompanies(selected.map((s) => s.value))}
              className="rounded-xl"
            />
            <Select
              isMulti
              placeholder="Filter by Skills"
              options={uniqueSkills.map((s) => ({ value: s, label: s }))}
              value={selectedSkills.map((s) => ({ value: s, label: s }))}
              onChange={(selected) => setSelectedSkills(selected.map((s) => s.value))}
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* ---------- JOB CARDS ---------- */}
      <section ref={jobsSectionRef}>
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-2 bg-white dark:bg-gray-900 cursor-pointer"
              >
                {/* Card Content */}
                <div className="p-6 flex flex-col items-center text-center space-y-3">
                  {job.logo && (
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-20 h-20 object-contain rounded-full border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{job.company}</p>

                  <div className="flex flex-wrap justify-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} /> {job.availability || "Flexible"}
                    </span>
                    {job.totalExperience && (
                      <span className="flex items-center gap-1">
                        <Calendar size={16} /> {job.totalExperience}+ yrs
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {job.skills?.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 transition-all"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {job.skills && job.skills.length > 4 && (
                      <Badge variant="outline" className="px-3 py-1 text-sm">
                        +{job.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Hover Overlay */}
<div className="absolute inset-0 bg-blue-400 bg-opacity-30 dark:bg-blue-900 dark:bg-opacity-50 text-white flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity px-4 text-center rounded-2xl">
  <p className="text-sm line-clamp-4">
    {job.description || "No description available."}
  </p>
  {job.deadline && (
    <p className="mt-2 text-xs">
      Apply by: {new Date(job.deadline).toLocaleDateString()}
    </p>
  )}
</div>




                {/* Apply Button */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition"
                    onClick={() => handleApplyClick(job)}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- APPLY MODAL ---------- */}
      {showModal && selectedJob && (
        <ApplyModal job={selectedJob} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
