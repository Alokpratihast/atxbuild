"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import BlogFormModal from "@/components/Admin/adminblog/BlogFormModal";
import Select from "react-select/creatable";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  category?: string;
  tags?: string[];
  seo?: any;
  author: { name: string };
  createdAt: string;
}

export default function BlogsDashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [sortField, setSortField] = useState<keyof Blog>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const limit = 5;

  // ------------------- Fetch Blogs -------------------
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (tagFilter) params.append("tag", tagFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortField", sortField);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/adminblog?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch blogs");

      setBlogs(data.blogs);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchBlogs();
    }, 500);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, categoryFilter, tagFilter, page, sortField, sortOrder]);

  // ------------------- Actions -------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`/api/adminblog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete blog");
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedBlogs.length) return toast.error("Select at least one blog");
    if (!confirm("Are you sure you want to delete selected blogs?")) return;
    try {
      await fetch(`/api/adminblog/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedBlogs }),
      });
      toast.success("Blogs deleted successfully");
      setSelectedBlogs([]);
      fetchBlogs();
    } catch (err: any) {
      toast.error("Failed to delete blogs");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleEditClick = (id: string) => {
    setEditingBlogId(id);
    setFormCollapsed(false);
  };

  const toggleForm = () => setFormCollapsed(!formCollapsed);

  const handleSort = (field: keyof Blog) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(blogs);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setBlogs(items);

    try {
      await fetch("/api/adminblog/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items.map((b) => b._id)),
      });
      toast.success("Order saved!");
    } catch (err: any) {
      toast.error("Failed to save order");
    }
  };

  const handleTagChange = async (blogId: string, tags: string[]) => {
    try {
      await fetch(`/api/adminblog/${blogId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      setBlogs((prev) =>
        prev.map((b) => (b._id === blogId ? { ...b, tags } : b))
      );
      toast.success("Tags updated!");
    } catch (err: any) {
      toast.error("Failed to update tags");
    }
  };

  const toggleSelectBlog = (id: string) => {
    setSelectedBlogs((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBlogs.length === blogs.length) setSelectedBlogs([]);
    else setSelectedBlogs(blogs.map((b) => b._id));
  };

  // ------------------- Render -------------------
  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Enterprise Blogs Dashboard</h1>
          <div className="flex gap-2">
            {selectedBlogs.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Selected
              </button>
            )}
            <button
              onClick={toggleForm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {formCollapsed ? "+ New Blog" : "Close Form"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Blog List */}
          <div className="flex-1 bg-white p-6 rounded-xl shadow-md border overflow-x-auto">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 sticky top-0 bg-white z-10 p-2 border-b">
              <input
                type="text"
                placeholder="Search by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded p-2 flex-1"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border rounded p-2"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <input
                type="text"
                placeholder="Category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Tag"
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="border rounded p-2"
              />
            </div>

            {/* Blog Table */}
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <p>No blogs found</p>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blogs">
                  {(provided) => (
                    <table
                      className="w-full border-collapse mt-2"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <thead>
                        <tr className="bg-gray-200 cursor-pointer">
                          <th className="p-2 border">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.length === blogs.length}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th onClick={() => handleSort("title")} className="p-2 border">
                            Title
                          </th>
                          <th className="p-2 border">Category</th>
                          <th className="p-2 border">Tags</th>
                          <th className="p-2 border">Status</th>
                          <th className="p-2 border">Author</th>
                          <th className="p-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((blog, index) => (
                          <Draggable key={blog._id} draggableId={blog._id} index={index}>
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="hover:bg-gray-50"
                              >
                                <td className="p-2 border">
                                  <input
                                    type="checkbox"
                                    checked={selectedBlogs.includes(blog._id)}
                                    onChange={() => toggleSelectBlog(blog._id)}
                                  />
                                </td>
                                <td className="p-2 border">{blog.title}</td>
                                <td className="p-2 border">{blog.category || "-"}</td>
                                <td className="p-2 border w-48">
                                  <Select
                                    isMulti
                                    options={[]} // populate dynamically
                                    value={blog.tags?.map((t) => ({ label: t, value: t }))}
                                    onChange={(vals) =>
                                      handleTagChange(blog._id, vals.map((v) => v.value))
                                    }
                                  />
                                </td>
                                <td className="p-2 border">{blog.status}</td>
                                <td className="p-2 border">{blog.author?.name || "-"}</td>
                                <td className="p-2 border space-x-2">
                                  <button
                                    onClick={() => handleEditClick(blog._id)}
                                    className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(blog._id)}
                                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded ${
                      page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Blog Form Overlay */}
          {!formCollapsed && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
              <div className="w-full md:w-1/3 bg-white p-6 shadow-xl overflow-auto relative animate-slide-in">
                <button
                  onClick={toggleForm}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
                <BlogFormModal
                  blogId={editingBlogId || undefined}
                  onSuccess={() => {
                    setEditingBlogId(null);
                    fetchBlogs();
                    setFormCollapsed(true);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
