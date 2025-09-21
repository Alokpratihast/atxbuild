// app/jobseekerdashboard/applications/page.tsx
import ApplicationList from "@/components/jobseekerdasboard/ApplicationList";

export default function ApplicationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Track the status of your job applications here.
      </p>

      {/* Application List */}
      <ApplicationList />
    </div>
  );
}
