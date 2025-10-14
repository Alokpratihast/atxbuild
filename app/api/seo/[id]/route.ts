import { NextRequest, NextResponse } from "next/server";
import SEO from "@/models/seo-model";
import { z, ZodError } from "zod";

const seoSchema = z.object({
  page: z.string().min(1, "Page is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  schema: z.string().optional(),
});

// Helper to prepare SEO data for DB
const prepareSEOData = (validated: z.infer<typeof seoSchema>) => ({
  page: validated.page,
  title: validated.title,
  description: validated.description,
  keywords: validated.keywords ?? [],
  canonical: validated.canonical || undefined,
  ogImage: validated.ogImage || undefined,
  twitterCard: validated.twitterCard || undefined,
  schema: validated.schema || undefined,
});


export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const seo = await SEO.findById(params.id);
  if (!seo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(seo);
};

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const validated = seoSchema.parse(body);

    const updated = await SEO.findByIdAndUpdate(
      params.id,
      prepareSEOData(validated),
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
};

export const DELETE = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const deleted = await SEO.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted successfully" });
};
