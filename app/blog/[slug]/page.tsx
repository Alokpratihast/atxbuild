// app/blog/[slug]/page.tsx
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";
import "@/models/adminblog/blogseo"; // Ensure BlogSEO model is registered
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

interface BlogPageProps {
  params: { slug: string };
}

// TypeScript-friendly blog type
type BlogFrontend = {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  createdAt: string;
  author?: { name: string };
  seo?: { title?: string; description?: string; ogImage?: string };
};

// Helper: truncate text
function truncate(text: string, length = 200) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}

// Fetch blog by slug
async function getBlogBySlug(slug: string): Promise<BlogFrontend | null> {
  await connectedToDatabase();

  const blog = await Blog.findOne({ slug, status: "published" })
    .populate("author", "name")
    .populate("seo", "title description ogImage") // BlogSEO
    .lean<BlogFrontend>();

  return blog || null;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt || truncate(blog.content || "", 160),
    openGraph: {
      title: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt || truncate(blog.content || "", 160),
      images: blog.seo?.ogImage ? [{ url: blog.seo.ogImage }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt || truncate(blog.content || "", 160),
      images: blog.seo?.ogImage ? [blog.seo.ogImage] : [],
    },
  };
}

// Main blog detail page
export default async function BlogDetailPage({ params }: BlogPageProps) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return notFound();

  await connectedToDatabase();

  // Prev/Next blogs using _id for cursor-style performance
  const [prevBlog, nextBlog] = await Promise.all([
    Blog.findOne({ _id: { $lt: blog._id }, status: "published" })
      .sort({ _id: -1 })
      .lean<BlogFrontend>(),
    Blog.findOne({ _id: { $gt: blog._id }, status: "published" })
      .sort({ _id: 1 })
      .lean<BlogFrontend>(),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Back link */}
      <div className="mb-6">
        <Link href="/blog" className="text-blue-600 font-medium hover:underline">
          ← Back to Blogs
        </Link>
      </div>

      {/* Blog Hero */}
      <div className="relative w-full h-96 overflow-hidden rounded-xl mb-8">
        <Image
          src={blog.coverImage || "/blog/default.jpg"}
          alt={blog.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Blog Title & Meta */}
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-500 mb-6">
        By {blog.author?.name || "Admin"} |{" "}
        {new Date(blog.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>

      {/* Blog Content */}
      <article
        className="prose max-w-full"
        dangerouslySetInnerHTML={{ __html: blog.content || "" }}
      />

      {/* Tags */}
      {blog.tags?.length ? (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Prev/Next Navigation */}
      {(prevBlog || nextBlog) && (
        <div className="flex justify-between mt-12 border-t pt-6">
          {prevBlog ? (
            <Link
              href={`/blog/${prevBlog.slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              ← {truncate(prevBlog.title, 50)}
            </Link>
          ) : <div />}
          {nextBlog ? (
            <Link
              href={`/blog/${nextBlog.slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              {truncate(nextBlog.title, 50)} →
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
