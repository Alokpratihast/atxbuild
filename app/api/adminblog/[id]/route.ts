import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";
import BlogSEO from "@/models/adminblog/blogseo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---------------- Schemas ----------------
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

// ---------------- Helpers ----------------
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "superadmin"].includes(session.user.role)) return null;
  return session;
}

async function generateUniqueSlug(titleOrSlug: string, blogId?: string) {
  let slug = titleOrSlug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
  const base = slug;
  let counter = 1;
  while (await Blog.findOne({ slug, _id: { $ne: blogId } })) slug = `${base}-${counter++}`;
  return slug;
}

// ---------------- PUT (Update) ----------------
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  await connectedToDatabase();
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { id } = context.params;
    console.log("🔍 Updating blog:", id);

    const body = await req.json();
    const validated = blogSchema.parse(body);

    const dbSession = await Blog.startSession();
    dbSession.startTransaction();

    try {
      let blog = await Blog.findById(id).session(dbSession);
      if (!blog) throw new Error("Blog not found");

      // Field updates
      if (validated.title && validated.title !== blog.title) {
        blog.slug = await generateUniqueSlug(validated.title, blog._id);
        blog.title = validated.title;
      }
      if (validated.content) blog.content = validated.content;
      if (validated.category) blog.category = validated.category;
      if (validated.excerpt !== undefined) blog.excerpt = validated.excerpt;
      if (validated.coverImage) blog.coverImage = validated.coverImage;
      if (validated.status) blog.status = validated.status;
      if (validated.tags) blog.tags = validated.tags;

      // SEO Handling
      if (validated.seo) {
        if (blog.seo) {
          await BlogSEO.findByIdAndUpdate(blog.seo, validated.seo, { session: dbSession });
        } else {
          const [newSEO] = await BlogSEO.create([{ blog: blog._id, ...validated.seo }], { session: dbSession });
          blog.seo = newSEO._id;
        }
      }

      await blog.save({ session: dbSession });
      await dbSession.commitTransaction();
      dbSession.endSession();

      blog = await Blog.findById(blog._id).populate("seo").populate("author");
      return NextResponse.json(blog);
    } catch (err) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw err;
    }
  } catch (err: any) {
    console.error("❌ PUT error:", err);
    if (err instanceof ZodError) return NextResponse.json({ errors: err.issues }, { status: 422 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  await connectedToDatabase();
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = context.params;
  console.log("🗑️ Deleting blog:", id);

  const dbSession = await Blog.startSession();
  dbSession.startTransaction();

  try {
    const blog = await Blog.findById(id).session(dbSession);
    if (!blog) throw new Error("Blog not found");

    if (blog.seo) await BlogSEO.findByIdAndDelete(blog.seo).session(dbSession);
    await blog.deleteOne({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err: any) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("❌ DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------- GET (By ID) ----------------
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await connectedToDatabase();
  const { id } = context.params;
  console.log("🔎 Fetching blog:", id);

  try {
    const blog = await Blog.findById(id).populate("seo").populate("author").lean();
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err: any) {
    console.error("❌ GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
