// app/api/adminblog/route.ts
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
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return null;
  }
  return session;
}

async function generateUniqueSlug(titleOrSlug: string, blogId?: string) {
  let slug = titleOrSlug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  const base = slug;
  let counter = 1;

  while (await Blog.findOne({ slug, _id: { $ne: blogId } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// ----------------- POST: Create Blog + SEO -----------------
export const POST = async (req: NextRequest) => {
  try {
    await connectedToDatabase();
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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

    const sessionDB = await Blog.startSession();
    sessionDB.startTransaction();

    try {
      const createdBlog = await Blog.create(
        [{ ...blogData, slug, author: blogData.author || session.user.id }],
        { session: sessionDB }
      );
      const newBlog = Array.isArray(createdBlog) ? createdBlog[0] : createdBlog;

      if (seoData) {
        const createdSEO = await BlogSEO.create(
          [{ blog: newBlog._id, ...seoData }],
          { session: sessionDB }
        );
        newBlog.seo = createdSEO[0]._id;
        await newBlog.save({ session: sessionDB });
      }

      await sessionDB.commitTransaction();
      sessionDB.endSession();

      const populatedBlog = await Blog.findById(newBlog._id)
        .populate("seo")
        .populate("author", "name email role")
        .lean();

      return NextResponse.json(populatedBlog, { status: 201 });
    } catch (err) {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      throw err;
    }
  } catch (err: any) {
    if (err instanceof ZodError)
      return NextResponse.json({ errors: err.issues }, { status: 422 });

    console.error("❌ Blog POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// ----------------- GET: Cursor-Based Pagination -----------------
export const GET = async (req: NextRequest) => {
  try {
    await connectedToDatabase();
    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // Filters
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("category"))
      filter.category = { $regex: searchParams.get("category"), $options: "i" };
    if (searchParams.get("search"))
      filter.title = { $regex: searchParams.get("search"), $options: "i" };
    if (searchParams.get("tag")) {
      const tags = searchParams.get("tag")!.split(",").map((t) => t.trim());
      filter.tags = { $in: tags.map((t) => new RegExp(t, "i")) };
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const cursor = searchParams.get("cursor");
    if (cursor) filter._id = { $lt: cursor };

    const blogs = await Blog.find(filter)
      .populate("seo")
      .populate("author", "name email role")
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = blogs.length > 0 ? blogs[blogs.length - 1]._id : null;

    // exclude _id from count
    const countFilter = { ...filter };
    delete countFilter._id;
    const total = await Blog.countDocuments(countFilter);

    const res = NextResponse.json({ blogs, nextCursor, total });
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (err: any) {
    console.error("❌ Blog GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
