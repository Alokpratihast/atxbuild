import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";
import BlogSEO from "@/models/adminblog/blogseo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---------------- SEO Schema ----------------
const seoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  structuredData: z.any().optional(),
  robots: z.string().optional(),
});

// ---------------- Blog Schema ----------------
const blogSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: seoSchema.optional(),
});

// ---------------- Auth Helper ----------------
async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
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

// ---------------- GET Blog by ID ----------------
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectedToDatabase();
    const blog = await Blog.findById(params.id).populate("seo").populate("author");
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// ---------------- PUT: Update Blog + SEO ----------------

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectedToDatabase();

    // Admin session
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Parse and validate body
    const body = await req.json();
    const validated = blogSchema.parse(body);

    // Find existing blog
    let blog = await Blog.findById(params.id);
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    // Keep old title for slug check
    // const oldTitle = blog.title;

    // Update fields individually
    if (validated.title) blog.title = validated.title;
    if (validated.content) blog.content = validated.content;
    if (validated.category) blog.category = validated.category;
    if (validated.excerpt !== undefined) blog.excerpt = validated.excerpt;
    if (validated.coverImage) blog.coverImage = validated.coverImage;
    if (validated.status) blog.status = validated.status;
    if (validated.tags) blog.tags = validated.tags;

    // Regenerate slug if title changed
    
    // Regenerate slug if title changed
    if (validated.title && validated.title !== blog.title) {
      blog.slug = await generateUniqueSlug(validated.title, blog._id);
    }


    // Handle SEO
    if (validated.seo) {
      if (blog.seo) {
        await BlogSEO.findByIdAndUpdate(blog.seo, validated.seo, { new: true });
      } else {
        const newSEO = await BlogSEO.create({ blog: blog._id, ...validated.seo });
        blog.seo = newSEO._id;
      }
    }

    // Save blog
    await blog.save();

    // Populate author and SEO before returning
    blog = await Blog.findById(blog._id).populate("seo").populate("author");

    return NextResponse.json(blog);

  } catch (err: any) {
    if (err instanceof ZodError) return NextResponse.json({ errors: err.issues }, { status: 422 });
    console.error("PUT /api/adminblog error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};


// ---------------- DELETE: Blog + SEO ----------------
export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectedToDatabase();
    const session = await requireAdmin(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const blog = await Blog.findById(params.id);
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    if (blog.seo) await BlogSEO.findByIdAndDelete(blog.seo);
    await blog.deleteOne();

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
