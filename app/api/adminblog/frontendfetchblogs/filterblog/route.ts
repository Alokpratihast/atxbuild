///api/adminblog/frontendfetchblogs/filterblog/route.ts

import { NextResponse } from "next/server";

import { connectedToDatabase } from "@/lib/db";
import Blog from "@/models/adminblog/Blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[API] Connecting to database...");
    await connectedToDatabase();
    console.log("[API] Connected to database");

    // Fetch distinct categories and tags
    const categories = await Blog.distinct("category", { status: "published" });
    const tags = await Blog.distinct("tags", { status: "published" });

    console.log("[API] Fetched categories:", categories);
    console.log("[API] Fetched tags:", tags);

    return NextResponse.json({ categories, tags }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API] Error fetching filters:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch filters", details: message }, { status: 500 });
  }
}
