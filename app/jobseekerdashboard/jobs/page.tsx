// app/jobseekerdashboard/jobs/page.tsx

import BrowseJobs from "@/components/jobs/browse";

export default function JobsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Browse and apply to jobs tailored for you.
      </p>

      {/* Job List Section */}
      {/* <JobList /> */}
      <BrowseJobs />
    </div>
  );
}
