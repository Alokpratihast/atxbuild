import { NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[API] Connecting to database...");
    await connectedToDatabase();
    console.log("[API] Connected to database");

    // Fetch distinct categories, tags, and titles
    const categories = await Blog.distinct("category", { status: "published" });
    const tags = await Blog.distinct("tags", { status: "published" });
    const titles = await Blog.distinct("title", { status: "published" });

    console.log("[API] Fetched categories:", categories);
    console.log("[API] Fetched tags:", tags);
    console.log("[API] Fetched titles:", titles);

    return NextResponse.json({ categories, tags, titles }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API] Error fetching filters:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch filters", details: message }, { status: 500 });
  }
}
