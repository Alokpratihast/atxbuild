// app/api/jobs/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Job from "@/models/admin-model";

export async function GET() {
  try {
    console.log("API HIT: /api/jobs");

    await connectedToDatabase();

    // ✅ Fetch only active jobs and sort latest first
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!jobs.length) {
      return NextResponse.json(
        { success: true, jobs: [], message: "No active jobs found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, jobs },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
