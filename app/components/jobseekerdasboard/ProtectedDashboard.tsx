// components/jobseekerdasboard/ProtectedDashboard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedDashboardProps {
  children: ReactNode;
}

export default function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "jobseeker") {
      router.replace("/"); // redirect to home/login if not authenticated or wrong role
    }
  }, [status, session, router]);

  if (status === "loading") return <p className="p-6">Loading...</p>;

  return <>{children}</>; // only render children if authenticated as jobseeker
}
