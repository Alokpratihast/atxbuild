import { NextRequest, NextResponse } from "next/server";
import SEO from "@/models/seo-model";
import { z } from "zod";

const seoSchema = z.object({
  page: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  schema: z.string().optional(),
});

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const seo = await SEO.findById(params.id);
  if (!seo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(seo);
};

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const validated = seoSchema.parse(body);

  const updated = await SEO.findByIdAndUpdate(
    params.id,
    {
      ...validated,
      keywords: validated.keywords || [],
      canonical: validated.canonical || "",
      ogImage: validated.ogImage || "",
      twitterCard: validated.twitterCard || "",
      schema: validated.schema || "",
    },
    { new: true }
  );

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
};

export const DELETE = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const deleted = await SEO.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted successfully" });
};
