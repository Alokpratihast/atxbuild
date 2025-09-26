"use client";

import Sidebar from "@/components/jobseekerdasboard/sidebar/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status, data: session } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a jobseeker
  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "jobseeker") {
      router.replace("/"); // redirect to homepage/login
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <p className="p-6">Loading...</p>; // show loading while checking session
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
