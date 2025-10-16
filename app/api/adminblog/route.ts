import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";
import BlogSEO from "@/models/adminblog/blogseo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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


// ---------------- Auth Helper ----------------
async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) return null;
  return session;
}
// ---------------- Slug Helper ----------------
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
// POST: Create Blog + SEO
export const POST = async (req: NextRequest) => {
  try {
    await connectedToDatabase();
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const validated = blogSchema.parse(body);

    // Generate unique slug
    const slug = await generateUniqueSlug(validated.slug || validated.title);


    // Separate SEO
    const { seo, ...blogData } = validated;
    let seoData = seo;
if (seo?.structuredData && typeof seo.structuredData === "string") {
  try {
    seoData = { ...seo, structuredData: JSON.parse(seo.structuredData) };
  } catch {
    return NextResponse.json({ error: "SEO structuredData must be valid JSON" }, { status: 422 });
  }
}


    // Create blog
    const blog = await Blog.create({ ...blogData, slug, author: blogData.author || session.user.id });

    // Create SEO if provided
    if (seo) {
      const blogSEO = await BlogSEO.create({ blog: blog._id, ...seo });
      blog.seo = blogSEO._id;
      await blog.save();
    }

    // Populate SEO and author
    const populatedBlog = await Blog.findById(blog._id).populate("seo").populate("author");

    return NextResponse.json(populatedBlog, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/adminblog error:", err);
    if (err instanceof ZodError) return NextResponse.json({ errors: err.issues }, { status: 422 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// GET: List Blogs
export const GET = async (req: NextRequest) => {
  try {
    await connectedToDatabase();

    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // Existing filters
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("category")) filter.category = searchParams.get("category");
    if (searchParams.get("search"))
      filter.title = { $regex: searchParams.get("search"), $options: "i" };

    // New tag filter
    if (searchParams.get("tag")) {
      filter.tags = { $in: searchParams.get("tag")!.split(",") };
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const total = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const blogs = await Blog.find(filter)
      .populate("seo")
      .populate("author")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ blogs, totalPages });

  } catch (err: any) {
    console.error("GET /api/adminblog error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
