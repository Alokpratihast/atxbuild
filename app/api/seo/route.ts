export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Seo from "@/models/seo-model";

// GET all SEO configs
export async function GET() {
  await connectedToDatabase();
  const seo = await Seo.find();
  return NextResponse.json({ success: true, seo });
}

// POST new SEO config
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();
    const seo = await Seo.create(body);
    return NextResponse.json({ success: true, seo }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create SEO" }, { status: 500 });
  }
}
