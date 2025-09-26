

import nextdynamic from "next/dynamic";
import { ReactNode } from "react";
import AdminPage from "@/admindashboard/ProtectedDashboard";

// Dynamic import to avoid hydration issues
const AdminSidebar = nextdynamic(() => import("@/components/Admin/Sidebar"), { ssr: false });

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPage>
      <head>
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>

      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 transition-all bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </AdminPage>
  );
}
