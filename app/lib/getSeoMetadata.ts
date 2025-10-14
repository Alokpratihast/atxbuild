import Seo from "@/models/seo-model";
import { connectedToDatabase } from "@/lib/db";
import { Metadata } from "next";

export const dynamic = "force-dynamic"; // runtime metadata

// TypeScript interface for SEO document
interface SEO {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  twitterCard?: "summary_large_image" | "summary" | "player" | "app";
  schema?: Record<string, any>;
}

/**
 * Fetch SEO metadata for a page.
 * If no document is found, returns default metadata.
 */
export async function getSeoMetadata(slug: string): Promise<Metadata> {
  try {
    // Ensure DB connection
    await connectedToDatabase();

    // Fetch SEO document (case-insensitive)
    const seoDoc = await Seo.findOne({ page: slug.toLowerCase() }).lean<SEO>();

    // Use optional chaining; no throwing
    return {
      title: seoDoc?.title || "ATX Technologies",
      description: seoDoc?.description || "Default description",
      keywords: seoDoc?.keywords?.join(", ") || "ATX, Technologies",
      alternates: { canonical: seoDoc?.canonical || process.env.NEXT_PUBLIC_BASE_URL },
      openGraph: {
        title: seoDoc?.title || "ATX Technologies",
        description: seoDoc?.description || "Default description",
        url: seoDoc?.canonical || process.env.NEXT_PUBLIC_BASE_URL,
        images: seoDoc?.ogImage ? [{ url: seoDoc.ogImage }] : [],
      },
      twitter: {
        card: seoDoc?.twitterCard || "summary_large_image",
        title: seoDoc?.title || "ATX Technologies",
        description: seoDoc?.description || "Default description",
        images: seoDoc?.ogImage ? [{ url: seoDoc.ogImage }] : [],
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    };
  } catch (err) {
    // Log unexpected errors but return defaults
    console.error("SEO fetch error:", err);
    return {
      title: "ATX Technologies",
      description: "Default description",
      keywords: "ATX, Technologies",
      alternates: { canonical: process.env.NEXT_PUBLIC_BASE_URL },
      openGraph: {},
      twitter: {},
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    };
  }
}
