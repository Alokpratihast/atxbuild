'use client';

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface SOPItem {
  _id?: string;
  title: string;
  category: string;
  fileUrl: string;
}

export default function SOPsTraining() {
  const [items, setItems] = useState<SOPItem[]>([]);
  const [form, setForm] = useState<SOPItem>({ title: "", category: "", fileUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ Fetch all items
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/corporatepage/sops");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      toast.error("Failed to fetch items");
    }
  };

  // ✅ Add or Update
  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.fileUrl) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/corporatepage/sops", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Item updated" : "Item added");
        setForm({ title: "", category: "", fileUrl: "" });
        setEditingId(null);
        fetchItems();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ✅ Delete item
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch("/api/corporatepage/sops", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item deleted");
        fetchItems();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ✅ Edit item
  const handleEdit = (item: SOPItem) => {
    setForm(item);
    setEditingId(item._id || null);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">SOPs & Training Materials</h2>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          placeholder="Title"
          className="border px-3 py-2 rounded"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
        />
        <input
          placeholder="Category (SOP / Training / Resource)"
          className="border px-3 py-2 rounded"
          value={form.category}
          onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
        />
        <input
          placeholder="File URL"
          className="border px-3 py-2 rounded md:col-span-2"
          value={form.fileUrl}
          onChange={(e) => setForm(prev => ({ ...prev, fileUrl: e.target.value }))}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        {editingId ? "Update Item" : "Add Item"}
      </button>

      {/* Item List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">List of Materials</h3>
        <ul className="space-y-2">
          {items.map(item => (
            <li
              key={item._id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <span className="font-medium">{item.title}</span> — {item.category}
                <br />
                <a href={item.fileUrl} target="_blank" className="text-blue-600 underline text-sm">
                  View / Download
                </a>
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
