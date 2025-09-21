'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Employee {
  _id?: string;
  name: string;
  dob: string;
  title: string;
  doj: string;
  email?: string;
  phone?: string;
  department?: string;
}

export default function EmployeeDetailsView() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ✅ Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/corporatepage/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        toast.error(data.error || "Failed to fetch employees");
      }
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Employee Details</h2>

      {/* Employee List */}
      {employees.length === 0 ? (
        <p className="text-gray-500">No employees found</p>
      ) : (
        <ul className="space-y-2">
          {employees.map((emp) => (
            <li
              key={emp._id}
              className="border p-3 rounded flex flex-col gap-1"
            >
              <p className="font-medium">{emp.name} — {emp.title}</p>
              <p className="text-sm text-gray-500">
                <strong>DOB:</strong> {emp.dob} | <strong>DOJ:</strong> {emp.doj}
              </p>
              {emp.department && (
                <p className="text-sm text-gray-500"><strong>Department:</strong> {emp.department}</p>
              )}
              {emp.email && (
                <p className="text-sm text-gray-500"><strong>Email:</strong> {emp.email}</p>
              )}
              {emp.phone && (
                <p className="text-sm text-gray-500"><strong>Phone:</strong> {emp.phone}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
