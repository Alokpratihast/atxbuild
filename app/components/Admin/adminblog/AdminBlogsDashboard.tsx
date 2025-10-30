
// // // // ✅ Key features:

// // // // Fetch and display all blogs with pagination (cursor-based)

// // // // Advanced filters (search, category, tags, status)

// // // // Sortable columns

// // // // Inline tag editing

// // // // Bulk delete

// // // // Integrated side-panel for create/edit blog (with BlogFormModal)








// "use client";

// import { useState, useEffect, useRef } from "react";
// import { toast } from "react-hot-toast";
// import BlogFormModal from "@/components/Admin/adminblog/BlogFormModal";
// import CreatableSelect from "react-select/creatable";
// import useSWRInfinite from "swr/infinite";
// import useSWR, { mutate } from "swr";

// // ------------------ Types ------------------
// interface Blog {
//   _id: string;
//   title: string;
//   slug: string;
//   status: "draft" | "published";
//   category?: string;
//   tags?: string[];
//   author: { name: string };
//   createdAt: string;
//   excerpt?: string;
// }

// interface OptionType {
//   label: string;
//   value: string;
// }

// // ------------------ Helpers ------------------
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// const useDebounce = (value: string, delay = 400) => {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debounced;
// };

// // ------------------ Component ------------------
// export default function BlogsDashboardPage() {
//   const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
//   const [formCollapsed, setFormCollapsed] = useState(true);
//   const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState<OptionType | null>(null);
//   const [tagFilter, setTagFilter] = useState<OptionType[]>([]);
//   const [sortField, setSortField] = useState<keyof Blog>("createdAt");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   const [tagsOptions, setTagsOptions] = useState<OptionType[]>([]);
//   const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);

//   const limit = 5;
//   const debouncedSearch = useDebounce(search);

//   // ------------------ SWR: Fetch Filters ------------------
//   const { data: filterData } = useSWR("/api/adminblog/frontendfetchblogs/filterblog", fetcher);
//   useEffect(() => {
//     if (filterData) {
//       setCategoryOptions(
//         Array.isArray(filterData.categories)
//           ? filterData.categories.map((c: string) => ({ label: c, value: c }))
//           : []
//       );
//       setTagsOptions(
//         Array.isArray(filterData.tags)
//           ? filterData.tags.map((t: string) => ({ label: t, value: t }))
//           : []
//       );
//     }
//   }, [filterData]);

//   // ------------------ SWRInfinite: Blogs ------------------
//   const getKey = (pageIndex: number, previousPageData: any) => {
//     if (previousPageData && !previousPageData.nextCursor) return null; // end reached
//     const cursor = pageIndex === 0 ? "" : previousPageData.nextCursor;

//     const params = new URLSearchParams({
//       search: debouncedSearch || "",
//       status: statusFilter || "",
//       category: categoryFilter?.value || "",
//       tag: tagFilter.map((t) => t.value).join(","),
//       limit: limit.toString(),
//       sortField,
//       sortOrder,
//     });
//     if (cursor) params.append("cursor", cursor);

//     return `/api/adminblog?${params.toString()}`;
//   };

//   const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
//     revalidateOnFocus: false,
//   });

//   const blogs: Blog[] = data ? data.flatMap((page: any) => page.blogs) : [];
//   const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

//   // Reset pages when filters/search change
//   useEffect(() => {
//     setSize(1);
//   }, [debouncedSearch, statusFilter, categoryFilter, tagFilter]);

//   // Infinite scroll observer
//   const loadMoreRef = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     if (isReachingEnd || isValidating) return;
//     const observer = new IntersectionObserver((entries) => {
//       if (entries[0].isIntersecting) setSize((prev) => prev + 1);
//     });
//     if (loadMoreRef.current) observer.observe(loadMoreRef.current);
//     return () => observer.disconnect();
//   }, [isReachingEnd, isValidating, size]);

//   // ------------------ Actions ------------------
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this blog?")) return;
//     try {
//       const res = await fetch(`/api/adminblog/${id}`, { method: "DELETE" });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error || "Failed to delete");
//       toast.success("Blog deleted successfully");
//       mutate(getKey(0, null)); // refresh first page
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedBlogs.length) return toast.error("Select at least one blog");
//     if (!confirm("Delete all selected blogs?")) return;
//     try {
//       await fetch(`/api/adminblog/bulkdelete`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids: selectedBlogs }),
//       });
//       toast.success("Blogs deleted");
//       setSelectedBlogs([]);
//       mutate(getKey(0, null));
//     } catch {
//       toast.error("Failed to delete blogs");
//     }
//   };

//   const handleTagChange = async (blogId: string, tags: string[]) => {
//     try {
//       await fetch(`/api/adminblog/${blogId}/tags`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tags }),
//       });
//       toast.success("Tags updated!");
//       mutate(getKey(0, null));
//     } catch {
//       toast.error("Failed to update tags");
//     }
//   };

//   const handleSort = (field: keyof Blog) => {
//     if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     else {
//       setSortField(field);
//       setSortOrder("asc");
//     }
//   };

//   // ------------------ Render ------------------
//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <div className="max-w-7xl mx-auto p-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//           <h1 className="text-2xl font-bold">Enterprise Blogs Dashboard</h1>
//           <div className="flex gap-2">
//             {selectedBlogs.length > 0 && (
//               <button
//                 onClick={handleBulkDelete}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
//               >
//                 Delete Selected
//               </button>
//             )}
//             <button
//               onClick={() => setFormCollapsed((prev) => !prev)}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//             >
//               {formCollapsed ? "+ New Blog" : "Close Form"}
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row gap-6">
//           {/* Blog List */}
//           <div className="flex-1 bg-white p-6 rounded-xl shadow-md border overflow-x-auto">
//             {/* Filters */}
//             <div className="flex flex-wrap gap-4 mb-4 sticky top-0 bg-white z-10 p-2 border-b shadow-sm">
//               <input
//                 type="text"
//                 placeholder="Search by title"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="border rounded p-2 flex-1 min-w-[180px]"
//               />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="border rounded p-2 min-w-[120px]"
//               >
//                 <option value="">All Status</option>
//                 <option value="draft">Draft</option>
//                 <option value="published">Published</option>
//               </select>

//               <CreatableSelect
//                 isClearable
//                 options={categoryOptions}
//                 value={categoryFilter}
//                 onChange={setCategoryFilter}
//                 placeholder="Filter by Category"
//                 menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
//                 styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//               />

//               <CreatableSelect<OptionType, true>
//                 isMulti
//                 isClearable
//                 options={tagsOptions}
//                 value={tagFilter}
//                 onChange={(newVal) => setTagFilter([...newVal])}
//                 placeholder="Filter by Tags"
//                 menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
//                 styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//               />
//             </div>

//             {/* Table */}
//             {error ? (
//               <p className="text-red-600">Error loading blogs</p>
//             ) : blogs.length === 0 && !isValidating ? (
//               <p>No blogs found</p>
//             ) : (
//               <table className="w-full border-collapse mt-2">
//                 <thead>
//                   <tr className="bg-gray-200 cursor-pointer">
//                     <th className="p-2 border">
//                       <input
//                         type="checkbox"
//                         checked={selectedBlogs.length === blogs.length}
//                         onChange={() =>
//                           setSelectedBlogs(
//                             selectedBlogs.length === blogs.length
//                               ? []
//                               : blogs.map((b) => b._id)
//                           )
//                         }
//                       />
//                     </th>
//                     <th onClick={() => handleSort("title")} className="p-2 border">
//                       Title
//                     </th>
//                     <th className="p-2 border">Category</th>
//                     <th className="p-2 border">Tags</th>
//                     <th className="p-2 border">Status</th>
//                     <th onClick={() => handleSort("createdAt")} className="p-2 border">
//                       Created
//                     </th>
//                     <th className="p-2 border">Author</th>
//                     <th className="p-2 border">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {blogs.map((blog) => (
//                     <tr key={blog._id} className="hover:bg-gray-50">
//                       <td className="p-2 border">
//                         <input
//                           type="checkbox"
//                           checked={selectedBlogs.includes(blog._id)}
//                           onChange={() =>
//                             setSelectedBlogs((prev) =>
//                               prev.includes(blog._id)
//                                 ? prev.filter((id) => id !== blog._id)
//                                 : [...prev, blog._id]
//                             )
//                           }
//                         />
//                       </td>
//                       <td className="p-2 border truncate max-w-xs">{blog.title}</td>
//                       <td className="p-2 border">{blog.category || "-"}</td>
//                       <td className="p-2 border w-48">
//                         <CreatableSelect
//                           isMulti
//                           options={tagsOptions}
//                           value={blog.tags?.map((t) => ({ label: t, value: t })) || []}
//                           onChange={(vals) => handleTagChange(blog._id, vals.map((v) => v.value))}
//                           menuPortalTarget={document.body}
//                           styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//                         />
//                       </td>
//                       <td className="p-2 border">{blog.status}</td>
//                       <td className="p-2 border">
//                         {new Date(blog.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="p-2 border">{blog.author?.name || "-"}</td>
//                       <td className="p-2 border space-x-2">
//                         <button
//                           onClick={() => {
//                             setEditingBlogId(blog._id);
//                             setFormCollapsed(false);
//                           }}
//                           className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(blog._id)}
//                           className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {/* Infinite scroll loader */}
//             <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
//               {isValidating && !isReachingEnd && <p>Loading more...</p>}
//               {isReachingEnd && blogs.length > 0 && <p>No more blogs</p>}
//             </div>
//           </div>

//           {/* Form Panel */}
//           {!formCollapsed && (
//             <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
//               <div className="w-full md:w-1/3 bg-white p-6 shadow-xl overflow-auto relative animate-slide-in">
//                 <button
//                   onClick={() => setFormCollapsed(true)}
//                   className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//                 >
//                   ✕
//                 </button>
//                 <BlogFormModal
//                   blogId={editingBlogId || undefined}
//                   onSuccess={() => {
//                     setEditingBlogId(null);
//                     setFormCollapsed(true);
//                     mutate(getKey(0, null));
//                   }}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out forwards;
//         }
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }














"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import BlogFormModal from "@/components/Admin/adminblog/BlogFormModal";
import CreatableSelect from "react-select/creatable";
import useSWRInfinite from "swr/infinite";
import useSWR, { mutate } from "swr";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronUp, ChevronDown, X, Trash, Plus } from "lucide-react";

// ------------------ Types ------------------
interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  category?: string;
  tags?: string[];
  author: { name: string };
  createdAt: string;
  excerpt?: string;
}

interface OptionType {
  label: string;
  value: string;
}

// ------------------ Helpers ------------------
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useDebounce = (value: string, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

// ------------------ Component ------------------
export default function BlogsDashboardPage() {
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<OptionType | null>(null);
  const [tagFilter, setTagFilter] = useState<OptionType[]>([]);
  const [sortField, setSortField] = useState<keyof Blog>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [tagsOptions, setTagsOptions] = useState<OptionType[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);

  const limit = 5;
  const debouncedSearch = useDebounce(search);

  // ------------------ SWR: Filters ------------------
  const { data: filterData } = useSWR("/api/adminblog/frontendfetchblogs/filterblog", fetcher);
  useEffect(() => {
    if (filterData) {
      setCategoryOptions(
        Array.isArray(filterData.categories)
          ? filterData.categories.map((c: string) => ({ label: c, value: c }))
          : []
      );
      setTagsOptions(
        Array.isArray(filterData.tags)
          ? filterData.tags.map((t: string) => ({ label: t, value: t }))
          : []
      );
    }
  }, [filterData]);

  // ------------------ SWRInfinite: Blogs ------------------
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData.nextCursor;
    const params = new URLSearchParams({
      search: debouncedSearch || "",
      status: statusFilter || "",
      category: categoryFilter?.value || "",
      tag: tagFilter.map((t) => t.value).join(","),
      limit: limit.toString(),
      sortField,
      sortOrder,
    });
    if (cursor) params.append("cursor", cursor);
    return `/api/adminblog?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const blogs: Blog[] = useMemo(() => data ? data.flatMap((page: any) => page.blogs) : [], [data]);
  const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

  useEffect(() => {
    setSize(1);
  }, [debouncedSearch, statusFilter, categoryFilter, tagFilter]);

  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isReachingEnd || isValidating) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setSize((prev) => prev + 1);
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isReachingEnd, isValidating, size]);

  // ------------------ Actions ------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`/api/adminblog/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      toast.success("Blog deleted successfully");
      mutate(() => true, undefined, { revalidate: true });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedBlogs.length) return toast.error("Select at least one blog");
    if (!confirm("Delete all selected blogs?")) return;
    try {
      await fetch(`/api/adminblog/bulkdelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedBlogs }),
      });
      toast.success("Blogs deleted");
      setSelectedBlogs([]);
      mutate(() => true, undefined, { revalidate: true });
    } catch {
      toast.error("Failed to delete blogs");
    }
  };

  const handleTagChange = async (blogId: string, tags: string[]) => {
    try {
      await fetch(`/api/adminblog/${blogId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      toast.success("Tags updated!");
      mutate(() => true, undefined, { revalidate: true });
    } catch {
      toast.error("Failed to update tags");
    }
  };

  const handleSort = (field: keyof Blog) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Enterprise Blogs Dashboard</h1>
          <div className="flex gap-2">
            {selectedBlogs.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                <Trash className="w-4 h-4" /> Delete Selected
              </button>
            )}
            <button
              onClick={() => {
                setEditingBlogId(null);
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> New Blog
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[180px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded p-2 min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <CreatableSelect
            isClearable
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Filter by Category"
            menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />

          <CreatableSelect<OptionType, true>
            isMulti
            isClearable
            options={tagsOptions}
            value={tagFilter}
            onChange={(newVal) => setTagFilter([...newVal])}
            placeholder="Filter by Tags"
            menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          {error ? (
            <p className="text-red-600 p-4">Error loading blogs</p>
          ) : blogs.length === 0 && !isValidating ? (
            <p className="p-4">No blogs found</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-2 border">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.length === blogs.length && blogs.length > 0}
                      onChange={() =>
                        setSelectedBlogs(
                          selectedBlogs.length === blogs.length ? [] : blogs.map((b) => b._id)
                        )
                      }
                    />
                  </th>
                  <th onClick={() => handleSort("title")} className="p-2 border cursor-pointer">
                    Title {sortField === "title" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                  </th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Tags</th>
                  <th className="p-2 border">Status</th>
                  <th onClick={() => handleSort("createdAt")} className="p-2 border cursor-pointer">
                    Created {sortField === "createdAt" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                  </th>
                  <th className="p-2 border">Author</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 even:bg-gray-100">
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedBlogs.includes(blog._id)}
                        onChange={() =>
                          setSelectedBlogs((prev) =>
                            prev.includes(blog._id)
                              ? prev.filter((id) => id !== blog._id)
                              : [...prev, blog._id]
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border truncate max-w-xs">{blog.title}</td>
                    <td className="p-2 border">{blog.category || "-"}</td>
                    <td className="p-2 border w-48">
                      <CreatableSelect
                        isMulti
                        options={tagsOptions}
                        value={blog.tags?.map((t) => ({ label: t, value: t })) || []}
                        onChange={(vals) => handleTagChange(blog._id, vals.map((v) => v.value))}
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      />
                    </td>
                    <td className="p-2 border text-center">{blog.status}</td>
                    <td className="p-2 border text-center">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 border text-center">{blog.author?.name || "-"}</td>
                    <td className="p-2 border text-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingBlogId(blog._id);
                          setIsDialogOpen(true);
                        }}
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
                ))}
              </tbody>
            </table>
          )}

          {/* Infinite scroll loader */}
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
            {isValidating && !isReachingEnd && <p>Loading more...</p>}
            {isReachingEnd && blogs.length > 0 && <p>No more blogs</p>}
          </div>
        </div>
      </div>

      {/* Dialog for Blog Form */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-0 right-0 w-full md:w-1/3 h-full bg-white shadow-xl z-50 p-6 overflow-auto animate-slide-in">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
            <BlogFormModal
              blogId={editingBlogId || undefined}
              onSuccess={() => {
                setEditingBlogId(null);
                setIsDialogOpen(false);
                mutate(() => true, undefined, { revalidate: true });
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
