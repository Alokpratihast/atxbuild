import HomeClient from "./homepage"; // Your HomeClient component
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug?: string[] }; // slug is optional for catch-all
}

// Helper: Convert slug array to string slug
function getSlugFromParams(slugArray?: string[]) {
  if (!slugArray || slugArray.length === 0) return "home";
  return slugArray.join("/").toLowerCase();
}

// ✅ Dynamic SEO for all pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = getSlugFromParams(params.slug);

  // Ignore static files
  if (
    slug === "favicon.ico" ||
    slug.endsWith(".png") ||
    slug.endsWith(".jpg") ||
    slug === "robots.txt"
  ) {
    return {
      title: "ATX Technologies",
      description: "Default description",
    };
  }

  const seo = await getSeoMetadata(slug);
  return seo;
}

// Main page component
export default function Page({ params }: PageProps) {
  const slug = getSlugFromParams(params.slug);

  // Example: if you have a services mapping
  if (slug.startsWith("services")) {
    return <div>Service Page: {slug}</div>;
  }

  // Default: Home page or other pages
  return <HomeClient />;
}
