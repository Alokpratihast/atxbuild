"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Briefcase, FileText, Star, Shield, Search, File, Building, UserPlus } from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { label: "Jobs", href: "/admindashboard/jobapplication", icon: Briefcase },
  { label: "Applications", href: "/admindashboard/jobcreate", icon: FileText },
  { label: "Shortlisted", href: "/admindashboard/shortlisted", icon: Star },
  { label: "Policies", href: "/admindashboard/policies", icon: Shield },
  { label: "SEO", href: "/admindashboard/seo", icon: Search },
  { label: "Offerletter", href: "/admindashboard/offerletter", icon: File },
  { label: "Corporatepage", href: "/admindashboard/corporatepage", icon: Building },
  { label: "Createadmin", href: "/admindashboard/createadmin", icon: UserPlus },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-2 m-2 rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
        role="navigation"
        aria-label="Admin Sidebar"
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Admin Panel</h2>
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-colors
                    ${pathname === href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
