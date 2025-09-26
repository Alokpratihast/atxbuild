"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.replace ("/"); // force redirect to home
  };

  return (
    <>
      {/* 🔹 Mobile Top Bar */}
      <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Dashboard
        </h1>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* 🔹 Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ease-in-out z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        role="navigation"
        aria-label="Sidebar Navigation"
        className={`fixed md:static top-0 left-0 h-full w-64 lg:w-72 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 flex flex-col
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <SidebarHeader />
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <SidebarMenu onNavigate={closeSidebar} />
        </div>

        {/* 🔹 Logout Button directly */}
        <div className="mt-auto px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
