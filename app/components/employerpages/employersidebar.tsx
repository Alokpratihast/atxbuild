"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
}

export default function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const items: SidebarItem[] = [
    {
      id: "UploadDocs",
      label: "📤 Upload Documents",
      href: "/employerdashboard/uploaddocs",
    },
    {
      id: "Corporatepage",
      label: "🏢 Corporate Panel",
      href: "/employerdashboard/corporatepage",
    },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/");
  };

  return (
    <>
      {/* 🔹 Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Employer Dashboard
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🔹 Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-72 max-w-[80%] bg-white border-r border-gray-200 flex flex-col shadow-lg md:shadow-none transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header (only desktop) */}
        <div className="hidden md:block p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Employer Dashboard
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)} // close sidebar on mobile
                className={`block px-4 py-2 rounded-lg font-medium transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium shadow transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
