'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Holiday {
  _id?: string;
  name: string;
  date: string;
  description?: string;
  isOptional?: boolean;
}

export default function HolidayCalendarView() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Fetch all holidays
  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/corporatepage/holidays");
      const data = await res.json();
      if (data.success) {
        setHolidays(data.data);
      } else {
        toast.error(data.error || "Failed to fetch holidays");
      }
    } catch {
      toast.error("Failed to fetch holidays");
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Holiday Calendar</h2>

      {/* Holiday List */}
      {holidays.length === 0 ? (
        <p className="text-gray-500">No holidays found</p>
      ) : (
        <ul className="space-y-2">
          {holidays.map((holiday) => (
            <li
              key={holiday._id}
              className="border p-3 rounded flex flex-col gap-1"
            >
              <p className="font-medium">
                {holiday.name} — {new Date(holiday.date).toLocaleDateString()}
                {holiday.isOptional && <span className="ml-2 text-sm text-yellow-600">(Optional)</span>}
              </p>
              {holiday.description && (
                <p className="text-sm text-gray-500">{holiday.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
