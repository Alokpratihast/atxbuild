import Career from "@/components/Menupages/Career";
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";
export const dynamic = "force-dynamic";


// Dynamic SEO for Career page
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("career"); // slug = "career"
  return seo;
}

// Server page wrapper
export default function CareerPageWrapper() {
  return <Career />; // Your client component stays as-is
}
