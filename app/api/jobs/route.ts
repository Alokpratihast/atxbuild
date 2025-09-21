// /app/api/jobs/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Job from "@/models/admin-model";

export async function GET() {
  try {
    await connectedToDatabase();

    const jobs = await Job.find({ isActive: true,  }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, jobs },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store", // 👈 This is key
        },
      }
    );
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
    
  }
  
}
console.log("API HIT: /api/userjobs");
