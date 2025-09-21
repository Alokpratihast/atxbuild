// components/jobseekerdasboard/DashboardCard.tsx
import { ReactNode } from "react";

export default function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl flex items-center space-x-4">
      {icon && <div className="text-blue-600 text-3xl">{icon}</div>}
      <div>
        <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
