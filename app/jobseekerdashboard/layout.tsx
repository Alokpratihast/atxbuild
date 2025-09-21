import DashboardLayout from "@/components/jobseekerdasboard/DashboardLayout";

export default function JobSeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
