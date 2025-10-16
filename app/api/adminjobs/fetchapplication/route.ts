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
      .populate("userId","firstName lastName ")
      .sort({ appliedAt: -1 });

    return NextResponse.json({ success: true, applications });
  } catch (err) {
    console.error("Admin fetch applications error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}
console.log("API HIT: /api/fetchjobapplication");


export async function POST(req: Request) {
  try {
    await connectedToDatabase();

    const formData = await req.formData();

    const jobId = formData.get("jobId") as string;
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const coverLetter = formData.get("coverLetter") as string;

    

    // 🎯 Newly added
    const resumeUrl = formData.get("resumeUrl") as string; // from ImageKit upload
    const originalFileName = formData.get("originalFileName") as string; // actual file name


    // ⚡ Save application
    const application = await Application.create({
      jobId,
      userId,
      name,
      email,
      contactNumber,
      coverLetter,
      
      resume: resumeUrl, // store ImageKit URL
      originalFileName,
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Error saving application:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to apply" },
      { status: 500 }
    );
  }
}
