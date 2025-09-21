
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import Application from "@/models/Application";
import Job from "@/models/admin-model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// ---------- CREATE NEW APPLICATION ----------
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const jobId = formData.get("jobId")?.toString();
    const contactNumber = formData.get("contactNumber")?.toString() || "";
    const coverLetter = formData.get("coverLetter")?.toString() || "";
    const resumeFile = formData.get("resume") as File;
    

    if (!jobId) {
      return NextResponse.json({ success: false, error: "Missing jobId" }, { status: 400 });
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid jobId" }, { status: 400 });
    }

    // Fetch job info
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "You have already applied to this job" }, { status: 400 });
    }

    // ---------- Save Resume File ----------
    let resumePath = "";
    if (resumeFile) {
      const uploadsDir = path.join(process.cwd(), "public/uploads/resumes");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, resumeFile.name);
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      resumePath = `/uploads/resumes/${resumeFile.name}`;
    }

    // Create application
    const newApp = await Application.create({
      jobId: new mongoose.Types.ObjectId(jobId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      name: session.user.name || "Anonymous",
      email: session.user.email,
      title: job.title,
      company: job.company,
      contactNumber,
      resume: resumePath,
      coverLetter,
      status: "Pending",
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (err) {
    console.error("Application submission error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 });
  }
}

// ---------- GET ALL APPLICATIONS FOR USER ----------
export async function GET() {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch apps for logged-in user + populate job details
    const applications = await Application.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })
      .populate("jobId", "title company location deadline")
      .sort({ appliedAt: -1 });

    return NextResponse.json({ success: true, applications });
  } catch (err) {
    console.error("Fetching applications error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}
console.log("API HIT: /api/jobsapplication");