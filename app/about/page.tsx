import About from "@/components/Menupages/About";
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";

// Dynamic SEO for About page
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("about"); // slug = "about"
  return seo;
}

// Server page wrapper
export default function AboutPageWrapper() {
  return <About />; // Your client About component stays as-is
}
