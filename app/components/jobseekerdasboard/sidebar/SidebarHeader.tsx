"use client";

import { useSession } from "next-auth/react";

export default function SidebarHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="p-4">Loading...</p>;

  const name = session?.user?.name || "Guest User";
  const email = session?.user?.email || "No email";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Avatar */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold">
        {initials}
      </div>

      {/* User info */}
      <div className="flex flex-col">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {email}
        </p>
      </div>
    </div>
  );
}
