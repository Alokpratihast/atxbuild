// app/admindashboard/layout.tsx
import AdminSidebar from "@/components/Admin/Sidebar";
export const dynamic = "force-dynamic";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:ml-64">{children}</main>
    </div>
  );
}
