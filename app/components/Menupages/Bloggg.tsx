"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { blogs } from "@/models/blogdata";

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  return (
    <>
      {/* ===== SEO Meta ===== */}
      <Head>
        <title>Our Blog | Company Name</title>
        <meta
          name="description"
          content="Discover insights, trends, and strategies on technology, business, design, and more."
        />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* ===== Header Section ===== */}
        <div className="relative w-full h-[500px] overflow-hidden rounded-b-3xl text-white text-center">
          <Image
            src="/blog/blogheader.jpg"
            alt="Blog Header"
            fill
            className="object-cover object-center brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-40/70 to-indigo-100/70 z-0"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Our Blog
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto opacity-90">
              Discover insights, trends, and strategies on technology, business,
              design, and more.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* ===== Blog Grid ===== */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {currentBlogs.map((blog) => {
              const isExternal = blog.slug.startsWith("http"); // 🔥 change: detect external vs internal

              return isExternal ? (
                // 🔥 change: use <a> for external links
                <a
                  key={blog.slug}
                  href={blog.slug}
                  target="_blank" // 🔥 change
                  rel="noopener noreferrer" // 🔥 change
                  aria-label={`Read more about ${blog.title}`}
                >
                  <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    <div className="relative w-full h-56 overflow-hidden">
                      <Image
                        src={blog.image || "/blog/default.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {blog.desc.length > 100
                          ? blog.desc.slice(0, 100) + "..."
                          : blog.desc}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {new Date(blog.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-blue-600 font-medium group-hover:underline">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ) : (
                // Internal Next.js Link
                <Link
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  aria-label={`Read more about ${blog.title}`}
                >
                  <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    <div className="relative w-full h-56 overflow-hidden">
                      <Image
                        src={blog.image || "/blog/default.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {blog.desc.length > 100
                          ? blog.desc.slice(0, 100) + "..."
                          : blog.desc}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {new Date(blog.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-blue-600 font-medium group-hover:underline">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ===== Pagination ===== */}
          <div className="flex justify-center mt-12 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                aria-current={currentPage === index + 1 ? "page" : undefined}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
