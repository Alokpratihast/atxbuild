"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/jobseekerdasboard/DashboardCard";
import { Briefcase, FileText, User, Settings } from "lucide-react";

export default function JobSeekerDashboardPage() {
  const [counts, setCounts] = useState({
    appliedJobs: 0,
    applications: 0,
    // profileViews: 0, // optional
    // settingsUpdated: "Yes",
  });

  useEffect(() => {
    async function fetchApplications() {
      const res = await fetch("/api/applications");
      const json = await res.json();
      if (json.success) {
        setCounts({
          appliedJobs: json.applications.length,
          applications: json.applications.filter((a: any) => a.status === "Pending").length,
          // profileViews: 0, // optional
          // settingsUpdated: "Yes",
        });
      }
    }
    fetchApplications();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Applied Jobs" value={counts.appliedJobs} icon={<Briefcase />} />
        <DashboardCard title="Applications" value={counts.applications} icon={<FileText />} />
        {/* <DashboardCard title="Profile Views" value={counts.profileViews} icon={<User />} /> */}
        {/* <DashboardCard title="Settings Updated" value={counts.settingsUpdated} icon={<Settings />} /> */}
      </div>
    </>
  );
}
