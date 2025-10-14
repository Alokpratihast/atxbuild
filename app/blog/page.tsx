import Bloggg from "@/components/Menupages/Bloggg";
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";
export const dynamic = "force-dynamic";


// Dynamic SEO for Blog page
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("blog"); // slug = "blog"
  return seo;
}

// Server page wrapper
export default function BlogPageWrapper() {
  return <Bloggg />; // Client component stays unchanged
}
