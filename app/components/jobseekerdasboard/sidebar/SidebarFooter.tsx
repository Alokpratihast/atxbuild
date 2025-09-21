"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react"; // ✅ modern icon set

export default function SidebarFooter() {
  return (
    <div className="mt-auto px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}
