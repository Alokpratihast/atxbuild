// app/api/seo/by-page/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import SEO from "@/models/seo-model";
import { connectedToDatabase } from "@/lib/db"; // import your helper

export const GET = async (_req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectedToDatabase(); // ✅ Connect first

    const seo = await SEO.findOne({ page: params.slug });

    if (!seo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(seo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
