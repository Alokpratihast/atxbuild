// app/admindashboard/layout.tsx
import EmployerSidebar from "@/components/employerpages/employersidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <EmployerSidebar />
      <main className="flex-1 p-6 md:ml-64">{children}</main>
    </div>
  );
}
