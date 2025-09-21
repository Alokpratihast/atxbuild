"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ApplicationCard from "./ApplicationCard"; // adjust path if needed

interface Application {
  _id: string;
  jobId: string;
  title: string;
  company: string;
  status: "Pending" | "Interview" | "Rejected" | "Accepted";
  appliedAt: string;
}

export default function MyApplications() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if user is admin (example: session.user.role)
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!userId) return;

    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/applications?userId=${userId}`);
        const data = await res.json();

        if (data.success) {
          const mappedApps = data.applications.map((app: any) => ({
            _id: app._id,
            jobId: app.jobId,
            title: app.title || "N/A",
            company: app.company || "N/A",
            status: app.status || "Pending",
            appliedAt: app.appliedAt || new Date().toISOString(),
          }));
          setApplications(mappedApps);
        } else {
          setError(data.error || "Failed to fetch applications.");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to fetch applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userId]);

  // Handle status update from card
  const handleStatusUpdate = (id: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status: newStatus as Application['status'] } : app))
    );
  };

  if (loading) return <p className="text-center p-4">Loading your applications...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!applications.length) return <p className="text-center">No applications found.</p>;

  return (
    <div className="grid grid-cols-1 gap-6">
      {applications.map((app) => (
        <ApplicationCard
          key={app._id}
          _id={app._id} // important for PATCH route
          title={app.title}
          company={app.company}
          status={app.status}
          appliedAt={app.appliedAt}
          isAdmin={isAdmin} // enable admin dropdown
          onStatusUpdate={(newStatus) => handleStatusUpdate(app._id, newStatus)}
        />
      ))}
    </div>
  );
}
