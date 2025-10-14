"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {  Menu, X, LogOut, Briefcase, FileText, Star, Shield,
  Search, File, Building, UserPlus} from "lucide-react";

import { signOut } from "next-auth/react";




const navLinks = [
  { label: "Jobs", href: "/admindashboard/jobapplication", icon: Briefcase },
  { label: "Applications", href: "/admindashboard/jobcreate", icon: FileText },
  { label: "Shortlisted", href: "/admindashboard/shortlisted", icon: Star },
  { label: "Policies", href: "/admindashboard/policies", icon: Shield },
  { label: "SEO", href: "/admindashboard/seo", icon: Search },
  { label: "Offerletter", href: "/admindashboard/offerletter", icon: File },
  { label: "Corporatepage", href: "/admindashboard/corporatepage", icon: Building },
  { label: "Createemployes", href: "/admindashboard/createadmin", icon: UserPlus },
  { label: "Providerverification", href: "/admindashboard/jobproviders", icon: UserPlus },
  { label: "Postblog", href: "/admindashboard/blogmanagement", icon: FileText },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

 const handleLogout = async () => {
  await signOut({ callbackUrl: "/" })
  window.location.replace("/"); // clears session and redirects
};



  return (
    <>
      {/* Toggle Button - only on mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-200 dark:bg-gray-700 p-2 rounded"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
    <aside
  className={`
    fixed top-18 left-0 max-h-screen overflow-y-auto w-64 h bg-white dark:bg-gray-900 z-50 shadow-lg
    transform transition-transform duration-300 ease-in-out
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:fixed md:shadow-none
  `}
>
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin</h2>
              <button onClick={() => setOpen(false)}>
                <X size={10} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${pathname === href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
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
              className="flex items-center w-full px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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
