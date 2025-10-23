import Blog from "@/models/adminblog/Blog";
import { connectedToDatabase } from "@/lib/db";

export async function GET(req: Request) {
  await connectedToDatabase();

  const blogs = await Blog.find({}, "tags category"); // only select tags & category

  // Aggregate unique tags
  const tagsSet = new Set<string>();
  const categoriesSet = new Set<string>();

  blogs.forEach(blog => {
    if (blog.category) categoriesSet.add(blog.category);
    if (blog.tags?.length) blog.tags.forEach((tag : string) => tagsSet.add(tag));
  });

  const tags = Array.from(tagsSet).map(tag => ({ label: tag, value: tag }));
  const categories = Array.from(categoriesSet).map(cat => ({ label: cat, value: cat }));

  return new Response(JSON.stringify({ tags, categories }), {
    headers: { "Content-Type": "application/json" },
  });
}
