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

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [form, setForm] = useState<Holiday>({ name: "", date: "", description: "", isOptional: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // -----------------------------
  // Fetch holidays
  // -----------------------------
  const fetchHolidays = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/corporatepage/holidays", { credentials: "include" });
      const data = await res.json();
      if (data.success) setHolidays(data.data);
      else toast.error(data.error || "Failed to fetch holidays");
    } catch {
      toast.error("Failed to fetch holidays");
    } finally {
      setFetching(false);
    }
  };

  // -----------------------------
  // Add / Update holiday
  // -----------------------------
  const handleSubmit = async () => {
    if (!form.name || !form.date) {
      toast.error("Please fill name and date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/corporatepage/holidays", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Holiday updated" : "Holiday added");
        resetForm();
        fetchHolidays();
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
  // Delete holiday
  // -----------------------------
  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this holiday?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/corporatepage/holidays", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Holiday deleted");
        fetchHolidays();
      } else toast.error(data.error || "Delete failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Edit holiday
  // -----------------------------
  const handleEdit = (holiday: Holiday) => {
    setForm(holiday);
    setEditingId(holiday._id || null);
  };

  const resetForm = () => {
    setForm({ name: "", date: "", description: "", isOptional: false });
    setEditingId(null);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // -----------------------------
  // Search filter
  // -----------------------------
  const filteredHolidays = holidays.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase()) ||
      new Date(h.date).toLocaleDateString().includes(search)
  );

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Holiday Calendar</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, description, or date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <input
          placeholder="Holiday Name *"
          className="border px-3 py-2 rounded"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={form.date}
          onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
        />
        <input
          placeholder="Description"
          className="border px-3 py-2 rounded md:col-span-2"
          value={form.description || ""}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
        />
        <label className="flex items-center space-x-2 md:col-span-2">
          <input
            type="checkbox"
            checked={form.isOptional || false}
            onChange={(e) => setForm(prev => ({ ...prev, isOptional: e.target.checked }))}
          />
          <span>Optional Holiday</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : editingId ? "Update Holiday" : "Add Holiday"}
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

      {/* Holiday List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Holiday List</h3>
        {fetching ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredHolidays.length === 0 ? (
          <p className="text-gray-500">No holidays found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredHolidays.map(h => (
              <li
                key={h._id}
                className="border p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2"
              >
                <div>
                  <span className="font-medium">{h.name}</span> — {new Date(h.date).toLocaleDateString()}
                  {h.isOptional && <span className="ml-2 text-sm text-yellow-600">(Optional)</span>}
                  {h.description && <div className="text-sm text-gray-500">{h.description}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => handleEdit(h)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDelete(h._id)}
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
