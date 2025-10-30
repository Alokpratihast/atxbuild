"use client";

import { Button } from "@/components/ui/button";

interface BlogListProps {
  blogs: any[];
  loading?: boolean;
  selected: string[];
  setSelected: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onDelete: (ids: string[]) => void;
}

export default function BlogList({
  blogs,
  loading,
  selected,
  setSelected,
  onEdit,
  onDelete,
}: BlogListProps) {
  if (loading) return <p>Loading blogs...</p>;
  if (!blogs?.length) return <p>No blogs found.</p>;

  const toggleSelect = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter((b) => b !== id) : [...selected, id]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">
              <input
                type="checkbox"
                checked={selected.length === blogs.length}
                onChange={(e) =>
                  setSelected(e.target.checked ? blogs.map((b) => b._id) : [])
                }
              />
            </th>
            <th className="p-2">Title</th>
            <th className="p-2">Category</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog._id} className="border-b hover:bg-gray-50">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(blog._id)}
                  onChange={() => toggleSelect(blog._id)}
                />
              </td>
              <td className="p-2 font-medium">{blog.title}</td>
              <td className="p-2">{blog.category || "-"}</td>
              <td className="p-2 capitalize">{blog.status}</td>
              <td className="p-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(blog._id)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete([blog._id])}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
