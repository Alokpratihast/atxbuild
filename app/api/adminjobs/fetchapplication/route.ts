export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Application from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// ---------- GET ALL APPLICATIONS (Admin) ----------
export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    // Check admin access (assuming session.user.role === "admin")
   if (!session || !["admin","superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

    // Fetch all applications + populate job details
    const applications = await Application.find()
      .populate("jobId", "title company location deadline")
      .sort({ appliedAt: -1 });

    return NextResponse.json({ success: true, applications });
  } catch (err) {
    console.error("Admin fetch applications error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}
console.log("API HIT: /api/fetchjobapplication");