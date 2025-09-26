// app/jobseekerdashboard/layout.tsx
import DashboardLayout from "@/components/jobseekerdasboard/DashboardLayout";
import { ReactNode } from "react";

interface JobSeekerDashboardLayoutProps {
  children: ReactNode;
}

export default function JobSeekerDashboardLayout({ children }: JobSeekerDashboardLayoutProps) {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        {/* Main dashboard content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
