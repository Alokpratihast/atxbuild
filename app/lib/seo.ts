export interface Seo {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
}

export async function getSeo(pagePath: string): Promise<Seo | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/seo`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) return null;

    return data.seo.find((s: Seo) => s.page === pagePath) || null;
  } catch (err) {
    console.error("SEO fetch error:", err);
    return null;
  }
}
