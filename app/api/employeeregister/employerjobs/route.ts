// app/api/employeeregister/employerjob/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Job from "@/models/employerjobmodel";
import ProviderVerification from "@/models/ProviderVerification";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


/**
 * GET /api/employeeregister/employerjob
 * - Employers: Fetch their own jobs (with pagination, filters)
 * - Public/Jobseekers: Fetch all active provider jobs
 */
export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "8");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "desc" ? -1 : 1;
    const filter = url.searchParams.get("filter");

    const skip = (page - 1) * limit;
    let query: any = {};

    // 🧩 Case 1: Employer logged in → show only their jobs
    if (session && session.user.role === "employer") {
      query.createdBy = session.user.id;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

      if (filter === "active") query.isActive = true;
      if (filter === "inactive") query.isActive = false;
    }

    // 🧩 Case 2: Public access → return all active & approved provider jobs
    else {
      query.isActive = true;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Fetch jobs
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Job.countDocuments(query);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/employerjob error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}


/**
 * POST /api/employeeregister/employerjob
 * Create a new job
 */
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check provider verification
    const verification = await ProviderVerification.findOne({ contactEmail: session.user.email }).sort({ createdAt: -1 });
    if (!verification || verification.status !== "approved") {
      return NextResponse.json({ success: false, error: "You can post jobs only after admin approval" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, location, company, salaryMin, salaryMax, totalExperience, skills, availability, deadline } = body;

    // Validate required fields
    if (!title || !description || !location || !company || !deadline) {
      return NextResponse.json({ success: false, error: "Title, description, location, company, and deadline are required" }, { status: 400 });
    }

    // Validate numeric fields
    const parsedSalaryMin = salaryMin !== undefined ? Number(salaryMin) : undefined;
    const parsedSalaryMax = salaryMax !== undefined ? Number(salaryMax) : undefined;
    const parsedTotalExperience = totalExperience !== undefined ? Number(totalExperience) : undefined;
    if (parsedSalaryMin !== undefined && parsedSalaryMax !== undefined && parsedSalaryMin > parsedSalaryMax) {
      return NextResponse.json({ success: false, error: "Minimum salary cannot exceed maximum salary" }, { status: 400 });
    }

    // Parse skills array
    let parsedSkills: string[] = [];
    if (skills) {
      parsedSkills = Array.isArray(skills)
        ? skills.map((s: string) => s.trim()).filter(Boolean)
        : skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (parsedSkills.length === 0) {
      return NextResponse.json({ success: false, error: "At least one skill is required" }, { status: 400 });
    }

    // Parse deadline
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid deadline date" }, { status: 400 });
    }

    // Create job
    const newJob = await Job.create({
      title,
      description,
      location,
      company,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      totalExperience: parsedTotalExperience,
      skills: parsedSkills,
      availability: availability || "Flexible",
      deadline: parsedDeadline,
      isActive: true, // default active
      createdBy: session.user.id,
      status: "pending", // default pending
    });

    return NextResponse.json({ success: true, job: newJob });

  } catch (err: any) {
    console.error("POST /api/employerjob error:", err);
    const message = err.errors ? Object.values(err.errors).map((e: any) => e.message).join(", ") : "Failed to create job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
