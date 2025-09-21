"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Settings,
} from "lucide-react";

// 🔹 Define the shape of each menu item
interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

// 🔹 Define props for SidebarMenu
interface SidebarMenuProps {
  onNavigate?: () => void; // optional, only needed on mobile
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/jobseekerdashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Jobs", path: "/jobseekerdashboard/jobs", icon: <Briefcase size={18} /> },
  { name: "Applications", path: "/jobseekerdashboard/applications", icon: <FileText size={18} /> },
  { name: "Profile", path: "/jobseekerdashboard/profile", icon: <User size={18} /> },
  { name: "Settings", path: "/jobseekerdashboard/settings", icon: <Settings size={18} /> },
];

export default function SidebarMenu({ onNavigate }: SidebarMenuProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-col space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onNavigate} // ✅ closes sidebar on mobile
            className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors duration-200
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <span className={`${isActive ? "text-white" : "text-gray-500"}`}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
