'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Employee {
  _id?: string;
  name: string;
 
  title: string;
  doj?: string;
  notOnBond?: boolean;
  email?: string;
  phone?: string;
  department?: string;
}

export default function EmployeeDetailsView() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch Employees
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
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Employee Details</h2>

      {employees.length === 0 ? (
        <p className="text-gray-500">No employees found</p>
      ) : (
        <ul className="space-y-4">
          {employees.map((emp) => (
            <li key={emp._id} className="border p-4 rounded flex flex-col gap-3 bg-gray-50">
              {/* Name & Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                <p className="text-gray-800">{emp.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <p className="text-gray-800">{emp.title}</p>
              </div>

              {/* DOJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Joining (DOJ)</label>
                <p className="text-gray-800">
                  {emp.notOnBond ? "Not on bond" : emp.doj || "N/A"}
                </p>
              </div>

              {/* Department */}
              {emp.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-800">{emp.department}</p>
                </div>
              )}

              {/* Email */}
              {emp.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-800">{emp.email}</p>
                </div>
              )}

              {/* Phone */}
              {emp.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-800">{emp.phone}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
