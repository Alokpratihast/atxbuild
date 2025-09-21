import DashboardCard from "@/components/jobseekerdasboard/DashboardCard";
import { Briefcase, FileText, User, Settings } from "lucide-react";

export default function JobSeekerDashboardPage() {
  return (
    <>
      {/* Dashboard Summary Section */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Applied Jobs" value={12} icon={<Briefcase />} />
        <DashboardCard title="Applications" value={5} icon={<FileText />} />
        <DashboardCard title="Profile Views" value={87} icon={<User />} />
        <DashboardCard title="Settings Updated" value="Yes" icon={<Settings />} />
      </div>
    </>
  );
}
