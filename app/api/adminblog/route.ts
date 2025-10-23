import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";
import BlogSEO from "@/models/adminblog/blogseo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ----------------- Zod Schemas -----------------
const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  structuredData: z.any().optional(),
  robots: z.string().optional(),
});

const blogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seo: seoSchema.optional(),
});

// ----------------- Helpers -----------------
async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    return null;
  }
  return session;
}

async function generateUniqueSlug(titleOrSlug: string, blogId?: string) {
  let slug = titleOrSlug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
  const originalSlug = slug;
  let counter = 1;

  while (await Blog.findOne({ slug, _id: { $ne: blogId } })) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// ----------------- POST: Create Blog + SEO -----------------
export const POST = async (req: NextRequest) => {
  await connectedToDatabase();
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await req.json();
    const validated = blogSchema.parse(body);
    const slug = await generateUniqueSlug(validated.slug || validated.title);
    const { seo, ...blogData } = validated;

    // Parse structuredData safely
    let seoData = seo;
    if (seo?.structuredData && typeof seo.structuredData === "string") {
      try {
        seoData = { ...seo, structuredData: JSON.parse(seo.structuredData) };
      } catch {
        return NextResponse.json({ error: "SEO structuredData must be valid JSON" }, { status: 422 });
      }
    }

    // ----------------- Transaction -----------------
    const sessionDB = await Blog.startSession();
    sessionDB.startTransaction();

    try {
      // Create blog
      const blog = await Blog.create([{ ...blogData, slug, author: blogData.author || session.user.id }], { session: sessionDB });
      
      // Create SEO if provided
      if (seo) {
        const blogSEO = await BlogSEO.create([{ blog: blog[0]._id, ...seoData }], { session: sessionDB });
        blog[0].seo = blogSEO[0]._id;
        await blog[0].save({ session: sessionDB });
      }

      await sessionDB.commitTransaction();
      sessionDB.endSession();

      // Populate SEO and author
      const populatedBlog = await Blog.findById(blog[0]._id).populate("seo").populate("author");
      return NextResponse.json(populatedBlog, { status: 201 });

    } catch (err) {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      throw err;
    }

  } catch (err: any) {
    if (err instanceof ZodError) return NextResponse.json({ errors: err.issues }, { status: 422 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// ----------------- GET: Cursor-Based Pagination -----------------
export const GET = async (req: NextRequest) => {
  await connectedToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // Status filter (exact match)
    if (searchParams.get("status")) filter.status = searchParams.get("status");

    // Category filter (case-insensitive)
    if (searchParams.get("category")) {
      filter.category = { $regex: searchParams.get("category"), $options: "i" };

    }

    // Title search (partial match)
    if (searchParams.get("search")) {
      filter.title = { $regex: searchParams.get("search"), $options: "i" };
    }

    // Tag filter (matches any tag in the array)
    if (searchParams.get("tag")) {
      const tags = searchParams.get("tag")!.split(",").map(t => t.trim());
      filter.tags = { $in: tags.map(t => new RegExp(t, "i")) };

    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const cursor = searchParams.get("cursor");
    if (cursor) filter._id = { $lt: cursor }; // cursor-based pagination

    // Fetch blogs
    const blogs = await Blog.find(filter)
      .populate("seo")
      .populate("author")
      .sort({ _id: -1 })
      .limit(limit);

    const nextCursor = blogs.length > 0 ? blogs[blogs.length - 1]._id : null;

    return NextResponse.json({ blogs, nextCursor }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
