// app/api/adminjobs/fetchshortlisted/route.ts

export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server";
import  Application  from "@/models/Application";
import {connectedToDatabase} from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
  await connectedToDatabase();
const session = await getServerSession(authOptions)

 if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


  try {
    const shortlistedApplicants = await Application.find({ status: "Shortlisted" })
      .populate("jobId", "title company")
      .sort({ appliedAt: -1 });

    return NextResponse.json({ success: true, applications: shortlistedApplicants });
  } catch (err) {
    console.error("Fetch shortlisted error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch shortlisted applications" }, { status: 500 });
  }
}
console.log("API HIT: /api/shortlistedjobs");
