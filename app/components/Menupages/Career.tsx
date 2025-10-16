"use client";



import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import ApplyModal from "../jobs/ApplyModal";

export default function CareerPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [currentIndex, setCurrentIndex] = useState(0); // Company slider
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceQuery, setExperienceQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const jobsSectionRef = useRef<HTMLDivElement>(null);

  const companies = [
    { id: 1, name: "Google", logo: "/carreer/career_1.webp" },
    { id: 2, name: "Microsoft", logo: "/carreer/career_2.webp" },
    { id: 3, name: "Amazon", logo: "/carreer/career_3.webp" },
    { id: 4, name: "Netflix", logo: "/carreer/career_4.webp" },
    { id: 5, name: "Meta", logo: "/carreer/career_5.webp" },
  ];

  // ---------- COMPANY SLIDER ----------
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? companies.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) =>
      prev === companies.length - 1 ? 0 : prev + 1
    );

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

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
        } else {
          console.error("Error fetching jobs:", data.error);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ---------- SEARCH & FILTER ----------
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const exp = experienceQuery.toLowerCase();
    const loc = locationQuery.toLowerCase();

    const filtered = jobs.filter((job) =>
      (job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)) &&
      (loc ? job.location.toLowerCase().includes(loc) : true) &&
      (exp ? job.description?.toLowerCase().includes(exp) : true)
    );

    setFilteredJobs(filtered);
    setShowSuggestions(false);
    jobsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ---------- SEARCH SUGGESTIONS ----------
  const suggestions = jobs
    .filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  // ---------- APPLY BUTTON ----------
  const handleApplyClick = (job: any) => {
    if (!currentUser) {
      alert("Please login to apply for jobs.");
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg p-12 flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-4">
          Find Your <span className="text-blue-600">Dream Job</span>
        </h1>
        {/* <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          Explore top companies and popular roles tailored for your skills.
        </p> */}

        {/* SEARCH INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Skills, Designations, Companies"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
            {showSuggestions && searchQuery && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-10 max-h-52 overflow-y-auto">
                {suggestions.map((job) => (
                  <li
                    key={job._id}
                    className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(job.title);
                      setShowSuggestions(false);
                    }}
                  >
                    {job.title} - {job.company}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="text"
            placeholder="Experience (e.g. 2 years)"
            value={experienceQuery}
            onChange={(e) => setExperienceQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />

          <input
            type="text"
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>

        <button
          className="mt-6 px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition"
          onClick={handleSearch}
        >
          <Search size={18} /> Search
        </button>
      </section>

      {/* ---------- TOP COMPANIES SLIDER ---------- */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">Top Companies</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Discover the best places to work</p>
        <div className="relative flex items-center">
          <button
            onClick={prevSlide}
            className="absolute left-0 z-10 p-3 bg-white dark:bg-gray-800 border rounded-full shadow-md hover:scale-110 transition"
          >
            ◀
          </button>
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {companies.map((company) => (
                <div key={company.id} className="flex-shrink-0 w-full flex justify-center px-2">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 flex flex-col items-center transform hover:scale-105 transition">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                    <p className="mt-4 font-medium text-gray-700 dark:text-gray-200 text-lg">{company.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="absolute right-0 z-10 p-3 bg-white dark:bg-gray-800 border rounded-full shadow-md hover:scale-110 transition"
          >
            ▶
          </button>
        </div>
      </section>

      {/* ---------- FILTERED JOBS ---------- */}
      <section ref={jobsSectionRef} className="mt-16">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
          Job Openings
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          Browse the latest job postings
        </p>

        {loading ? (
          <p className="text-center text-gray-500 col-span-full">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No jobs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg p-6 flex flex-col justify-between transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white group-hover:text-blue-600 transition">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{job.company}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {job.location || "Not specified"}
                  </span>
                </div>

                <button
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition duration-300 transform hover:-translate-y-1"
                  onClick={() => handleApplyClick(job)}
                >
                  Apply Now
                </button>
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
