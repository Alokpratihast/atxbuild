// types/BlogFormData.ts

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  twitterCard?: string;
  robots?: string;
  structuredData?: any;
}

export interface BlogFormData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string; // optional, filled from session/admin
  status: "draft" | "published";
  seo?: SEOData;
}
