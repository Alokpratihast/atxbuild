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

export default function EmployeeDetails() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<Employee>({
    name: "",
    dob: "",
    title: "",
    doj: "",
    email: "",
    phone: "",
    department: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // -----------------------------
  // Fetch Employees
  // -----------------------------
  const fetchEmployees = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/corporatepage/employees", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setEmployees(data.data);
      else toast.error(data.error || "Failed to fetch employees");
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setFetching(false);
    }
  };

  // -----------------------------
  // Add / Update Employee
  // -----------------------------
  const handleSubmit = async () => {
    if (!form.name || !form.dob || !form.title || !form.doj) {
      toast.error("Fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/corporatepage/employees", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Employee updated" : "Employee added");
        resetForm();
        fetchEmployees();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Delete Employee
  // -----------------------------
  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this employee?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/corporatepage/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Employee deleted");
        fetchEmployees();
      } else toast.error(data.error || "Delete failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fill form for editing
  // -----------------------------
  const handleEdit = (emp: Employee) => {
    setForm(emp);
    setEditingId(emp._id || null);
  };

  // -----------------------------
  // Reset form
  // -----------------------------
  const resetForm = () => {
    setForm({
      name: "",
      dob: "",
      title: "",
      doj: "",
      email: "",
      phone: "",
      department: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // -----------------------------
  // Search filter
  // -----------------------------
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Employee Management</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <input
          placeholder="Name *"
          className="border px-3 py-2 rounded"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={form.dob}
          onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
        />
        <input
          placeholder="Title *"
          className="border px-3 py-2 rounded"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={form.doj}
          onChange={(e) => setForm((prev) => ({ ...prev, doj: e.target.value }))}
        />
        <input
          placeholder="Phone"
          className="border px-3 py-2 rounded"
          value={form.phone || ""}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <input
          placeholder="Department"
          className="border px-3 py-2 rounded"
          value={form.department || ""}
          onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
        />
        <input
          placeholder="Email"
          type="email"
          className="border px-3 py-2 rounded md:col-span-2"
          value={form.email || ""}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>

      {/* Form Buttons */}
      <div className="flex space-x-2 mt-2">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : editingId ? "Update Employee" : "Add Employee"}
        </button>
        {editingId && (
          <button
            className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
            onClick={resetForm}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Employee List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Employee List</h3>
        {fetching ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-gray-500">No employees found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredEmployees.map((emp) => (
              <li
                key={emp._id}
                className="border p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2"
              >
                <div>
                  <span className="font-medium">{emp.name}</span> — {emp.title}
                  <br />
                  <span className="text-sm text-gray-500">{emp.email}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => handleEdit(emp)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDelete(emp._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
