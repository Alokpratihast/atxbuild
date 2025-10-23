

"use client";

import useSWR, { SWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import CreatableSelect from "react-select/creatable";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogFrontend {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  excerpt?: string;
  createdAt: string;
  category?: string;
  tags: string[];
}

interface Option {
  value: string;
  label: string;
}

// const fetcher = (url: string) => fetch(url).then(res => res.json());
const fetcher = async (url: string) => {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      : window.location.origin;

  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const res = await fetch(fullUrl);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch: ${res.status} - ${text}`);
  }

  return res.json();
};



export default function BlogPage() {
  // -------------------- Filter Data --------------------
  const { data: filterData, error: filterError } = useSWR(
    "/api/adminblog/frontendfetchblogs/filterblog",
    fetcher
  );
  console.log("Filter Data:", filterData);

  const initialCategories: Option[] = filterData?.categories?.map((c: string) => ({ value: c, label: c })) || [];
  const initialTags: Option[] = filterData?.tags?.map((t: string) => ({ value: t, label: t })) || [];

  // -------------------- Filter States --------------------
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryFilter, setCategoryFilter] = useState<Option[]>([]);
  const [tagFilter, setTagFilter] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>(initialCategories);
  const [tags, setTags] = useState<Option[]>(initialTags);

  // -------------------- Debounce Search --------------------
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // -------------------- SWR Infinite Blogs --------------------
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.hasNextPage) return null; // end reached

    const params = new URLSearchParams();
    params.set("limit", "6");
    if (pageIndex > 0) params.set("cursor", previousPageData.nextCursor);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryFilter.length) params.set("category", categoryFilter.map(c => c.value).join(","));
    if (tagFilter.length) params.set("tag", tagFilter.map(t => t.value).join(","));

    return `/api/adminblog/frontendfetchblogs?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const blogs = data ? data.flatMap(page => page.blogs as BlogFrontend[]) : [];
  const hasNextPage = data ? data[data.length - 1].hasNextPage : true;

  // -------------------- Infinite Scroll --------------------
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isValidating) {
        setSize(size + 1);
      }
    },
    [hasNextPage, isValidating, setSize, size]
  );

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(handleObserver, { threshold: 1.0 });
    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [handleObserver]);

  // -------------------- Live Filter Effect --------------------
  useEffect(() => {
    setSize(1); // reset to first page whenever filters/search change
  }, [debouncedSearch, categoryFilter, tagFilter, setSize]);

  if (filterError) console.error("Failed to load filters:", filterError);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="relative w-full h-[500px] overflow-hidden rounded-b-3xl text-white text-center">
        <Image src="/blog/blogheader.jpg" alt="Blog Header" fill className="object-cover object-center brightness-75" priority unoptimized />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-5xl font-extrabold mb-4">Our Blog</h1>
          <p className="text-lg opacity-90">Discover insights, trends, and strategies on technology, business, design, and more.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[200px]"
        />

        <div className="w-64">
          <CreatableSelect
            isMulti
            options={categories}
            value={categoryFilter}
            onChange={selected => setCategoryFilter(selected as Option[])}
            onCreateOption={(inputValue) => {
              const newOption = { value: inputValue, label: inputValue };
              setCategories(prev => [...prev, newOption]);
              setCategoryFilter(prev => [...prev, newOption]);
            }}
            placeholder="Filter by Categories"
          />
        </div>

        <div className="w-64">
          <CreatableSelect
            isMulti
            options={tags}
            value={tagFilter}
            onChange={selected => setTagFilter(selected as Option[])}
            onCreateOption={(inputValue) => {
              const newOption = { value: inputValue, label: inputValue };
              setTags(prev => [...prev, newOption]);
              setTagFilter(prev => [...prev, newOption]);
            }}
            placeholder="Filter by Tags"
          />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {blogs.length === 0 && isValidating && <p className="col-span-3 text-center text-gray-500">Loading blogs...</p>}

        {blogs.map(blog => (
          <Link key={blog._id} href={`/blog/${blog.slug}`}>
            <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
              <div className="relative w-full h-56 overflow-hidden">
                <Image src={blog.coverImage || "/blog/default.jpg"} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition">{blog.title}</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">{blog.excerpt?.slice(0, 100) || "No description."}...</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <span className="text-blue-600 font-medium">Read More →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {blogs.length === 0 && !isValidating && <p className="col-span-3 text-center text-gray-500">No blogs found.</p>}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isValidating && <p className="text-gray-500">Loading more...</p>}
        {!hasNextPage && blogs.length > 0 && <p className="text-gray-500">You have reached the end.</p>}
      </div>
    </div>
  );
}
