'use client';
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Policy {
  _id?: string;
  title: string;
  fileUrl: string;
}

export default function HRPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Add / Update policy
  const handleUpload = () => {
    if (!title || !file) {
      toast.error("Please enter title and select a file");
      return;
    }
    setLoading(true);
    try {
      const fileUrl = URL.createObjectURL(file); // temporary preview
      const newPolicy = { title, fileUrl };

      if (editingIndex !== null) {
        const updated = [...policies];
        updated[editingIndex] = newPolicy;
        setPolicies(updated);
        toast.success("Policy updated");
      } else {
        setPolicies(prev => [...prev, newPolicy]);
        toast.success("Policy uploaded");
      }

      // Reset form
      setTitle("");
      setFile(null);
      setEditingIndex(null);
    } catch (err) {
      toast.error("Failed to upload policy");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit existing policy
  const handleEdit = (index: number) => {
    setTitle(policies[index].title);
    // Cannot re-upload file, user needs to select again
    setEditingIndex(index);
  };

  // Delete policy
  const handleDelete = (index: number) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    setPolicies(prev => prev.filter((_, i) => i !== index));
    toast.success("Policy deleted");
  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">HR Policies</h2>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Policy Title"
          className="border px-3 py-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : editingIndex !== null ? "Update Policy" : "Upload Policy"}
        </button>
        {editingIndex !== null && (
          <button
            onClick={() => { setTitle(""); setFile(null); setEditingIndex(null); }}
            className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Policy List */}
      <div className="mt-6">
        {policies.length === 0 ? (
          <p className="text-gray-500">No policies uploaded</p>
        ) : (
          <ul className="space-y-2">
            {policies.map((p, idx) => (
              <li
                key={idx}
                className="border p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2"
              >
                <div>
                  <span className="font-medium">{p.title}</span>
                  <div className="text-sm text-gray-500">{p.fileUrl.split("/").pop()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <a
                    href={p.fileUrl}
                    target="_blank"
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
