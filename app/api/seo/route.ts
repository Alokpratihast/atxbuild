import { NextRequest, NextResponse } from "next/server";
import SEO from "@/models/seo-model";
import { z, ZodError } from "zod";

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



export const GET = async () => {
  try {
    const seoList = await SEO.find();
    return NextResponse.json(seoList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};



export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = seoSchema.parse(body);

    const seo = await SEO.findOneAndUpdate(
      { page: validated.page }, // Match by page
      {
        page: validated.page,
        title: validated.title,
        description: validated.description,
        keywords: validated.keywords ?? [],
        canonical: validated.canonical || undefined,
        ogImage: validated.ogImage || undefined,
        twitterCard: validated.twitterCard || undefined,
        schema: validated.schema || undefined,
      },
      { upsert: true, new: true } // create if not exists, return updated doc
    );

    return NextResponse.json(seo);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
};

