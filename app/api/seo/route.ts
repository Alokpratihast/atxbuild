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

    // Upsert: create new or update existing page
    const seo = await SEO.findOneAndUpdate(
      { page: validated.page },    // Match by page
      {
        $set: {
          ...validated,
          keywords: validated.keywords || [],
          canonical: validated.canonical || "",
          ogImage: validated.ogImage || "",
          twitterCard: validated.twitterCard || "",
          schema: validated.schema || "",
        },
      },
      { upsert: true, new: true } // Create if not exists, return the updated document
    );

    return NextResponse.json(seo);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 422 });
    }
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
