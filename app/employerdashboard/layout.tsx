import EmployerSidebar from "@/components/employerpages/employersidebar";
import ProtectedDashboard from "@/employerdashboard/ProtectedEmployerDashboard";

export default function EmployLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboard>
      <div className="flex min-h-screen">
        <EmployerSidebar />
        <main className="flex-1 p-6 md:ml-64">{children}</main>
      </div>
    </ProtectedDashboard>
  );
}
