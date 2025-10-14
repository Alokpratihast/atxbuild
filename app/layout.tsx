// app/layout.tsx
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopBtn from "@/components/ScrollToTopBtn";
import AuthModalWrapper from "@/components/AuthModalWrapper";
import Providers from "./Providers";
import { getSeoMetadata } from "@/lib/getSeoMetadata";
import { Metadata } from "next";

interface RootLayoutProps {
  children: React.ReactNode;
  params?: { slug?: string[] };
  pathname?: string | undefined;
}

// Helper: Convert pathname to slug
function getSlugFromPath(pathname: string) {
  if (pathname === "/" || !pathname) return "home";
  return pathname.replace(/^\/+/, ""); // "/about" → "about"
}

// Generate dynamic metadata for all pages
export async function generateMetadata({ params, pathname }: RootLayoutProps): Promise<Metadata> {
  // TypeScript-safe: fallback to "/" if pathname is undefined
  const slug = params?.slug?.join("/") || getSlugFromPath(pathname || "/");

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

export default async function RootLayout({ children, params }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollToTopBtn />
          <AuthModalWrapper />
        </Providers>
      </body>
    </html>
  );
}
