// // app/api/adminblog/frontendfetchblogs/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import mongoose from "mongoose";
// import { connectedToDatabase } from "@/lib/db";
// import Blog, { IBlog } from "@/models/adminblog/Blog";

// export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest) {
//   try {
//     await connectedToDatabase();

//     const url = req.nextUrl;

//     // Parse query params
//     const limit = Math.min(Number(url.searchParams.get("limit")) || 3, 50); // max 50
//     const cursor = url.searchParams.get("cursor"); // last blog _id from previous page
//     const search = url.searchParams.get("search") || "";
//     const category = url.searchParams.get("category");
//     const tag = url.searchParams.get("tag");

//     // Build filter
//     const filter: any = { status: "published" };
//     if (search) filter.title = { $regex: search, $options: "i" };
//     if (category) filter.category = category;
//     if (tag) filter.tags = { $in: tag.split(",") };
//     if (cursor) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) }; // cursor-based pagination

//     // Fetch blogs
//     const blogs: (IBlog & { _id: mongoose.Types.ObjectId })[] = await Blog.find(filter)
//       .sort({ _id: -1 }) // newest first
//       .limit(limit)
//       .lean<(IBlog & { _id: mongoose.Types.ObjectId })[]>(); // Type-safe _id

//     // Next cursor for "Load More"
//     const lastBlog = blogs[blogs.length - 1];
//     const nextCursor: string | null = lastBlog ? lastBlog._id.toString() : null;

//     return NextResponse.json({
//       blogs,
//       nextCursor,
//       limit,
//     });

//   } catch (err: unknown) {
//     console.error("API error:", err);

//     const message = err instanceof Error ? err.message : String(err);

//     return NextResponse.json(
//       { error: "Failed to fetch blogs", details: message },
//       { status: 500 }
//     );
//   }
// }


// app/api/adminblog/frontendfetchblogs/route.ts// app/api/adminblog/frontendfetchblogs/route.ts
import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";

export const dynamic = "force-dynamic";

type BlogFrontend = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  createdAt: Date;
};

function truncateExcerpt(text: string, length = 200) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}

export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();

    const url = req.nextUrl;
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 5, 1), 50);
    const cursor = url.searchParams.get("cursor");
    const search = url.searchParams.get("search")?.trim() || "";
    const categories = (url.searchParams.get("category")?.split(",") || []).filter(Boolean);
    const tags = (url.searchParams.get("tag")?.split(",") || []).filter(Boolean);

    const filter: any = { status: "published" };

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [{ title: regex }, { content: regex }, { tags: regex }, { category: regex }];
    }

    if (categories.length) filter.category = { $in: categories };
    if (tags.length) filter.tags = { $in: tags };
    if (cursor) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const blogs: BlogFrontend[] = await Blog.find(filter, {
      _id: 1,
      title: 1,
      slug: 1,
      excerpt: 1,
      coverImage: 1,
      category: 1,
      tags: 1,
      createdAt: 1,
    })
      .sort({ _id: -1 })
      .limit(limit)
      .lean<BlogFrontend[]>();

    const blogsWithExcerpt = blogs.map(blog => ({
      ...blog,
      excerpt: truncateExcerpt(blog.excerpt || ""),
    }));

    const lastBlog = blogsWithExcerpt[blogsWithExcerpt.length - 1];
    const hasNextPage = blogsWithExcerpt.length === limit;
    const nextCursor = hasNextPage && lastBlog ? lastBlog._id.toString() : null;

    return NextResponse.json(
      { blogs: blogsWithExcerpt, nextCursor, hasNextPage, limit },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("API error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch blogs", details: message }, { status: 500 });
  }
}

