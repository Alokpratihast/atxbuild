// app/api/employeeregister/employerjob/route.ts
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import Job from "@/models/employerjobmodel";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // your next-auth config
import ProviderVerification from "@/models/ProviderVerification";




export async function GET(req: NextRequest) {

  

  await connectedToDatabase();

  
  try {
    const session = await getServerSession(authOptions);
   if (!session || !["employer"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

    await connectedToDatabase();

    const { search, page = "1", limit = "8", sortBy, sortOrder, filter } =
      Object.fromEntries(new URL(req.url).searchParams);

    const query: any = {};

    // Ensure only jobs created by this employer
if (session?.user?.role === "employer") {
  query.createdBy = session.user.id;
}

    // search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // 👇 Active / Inactive filter
    if (filter === "active") query.isActive = true;
    if (filter === "inactive") query.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .sort(sortBy ? { [sortBy]: sortOrder === "desc" ? -1 : 1 } : {})
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/adminjobs error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);

     if (!session || !["employer"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
    }

    // ==== Verification check ====
const verification = await ProviderVerification.findOne({
  contactEmail: session.user.email
}).sort({ createdAt: -1 });

if (!verification || verification.status !== "approved") {
  return NextResponse.json(
    { success: false, error: "Your documents are not approved by admin yet" },
    { status: 403 }
  );
}
// ============================


    const body = await req.json();

    const {
      title,
      description,
      location,
      company,
      salaryMin,
      salaryMax,
      totalExperience,
      skills,
      availability,
      deadline,
      isActive,
    } = body;

    // ✅ Basic validation
    if (!title || !description || !location || !company || !deadline) {
      return NextResponse.json(
        { success: false, error: "Title, description, location, company, and deadline are required" },
        { status: 400 }
      );
    }

    // ✅ Parse/convert fields
    const parsedSalaryMin = salaryMin ? Number(salaryMin) : undefined;
    const parsedSalaryMax = salaryMax ? Number(salaryMax) : undefined;
    const parsedTotalExperience = totalExperience ? Number(totalExperience) : undefined;

   let parsedSkills: string[] = [];
    if (skills) {
      if (typeof skills === "string") {
        parsedSkills = skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      } else if (Array.isArray(skills)) {
        parsedSkills = skills.map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const parsedDeadline = new Date(deadline);
    const parsedAvailability = availability || "Flexible";
    const parsedIsActive = isActive !== undefined ? Boolean(isActive) : true;

    // Optional: check salary range
    if (parsedSalaryMin !== undefined && parsedSalaryMax !== undefined && parsedSalaryMin > parsedSalaryMax) {
      return NextResponse.json(
        { success: false, error: "Minimum salary cannot exceed maximum salary" },
        { status: 400 }
      );
    }

    const newJob = await Job.create({
      title,
      description,
      location,
      company,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      totalExperience: parsedTotalExperience,
      skills: parsedSkills,
      availability: parsedAvailability,
      deadline: parsedDeadline,
      isActive: false,
      createdBy: session.user.id,
      status: "pending", // default status
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (err: any) {
    console.error("Error creating job:", err);

    const message = err.errors
      ? Object.values(err.errors).map((e: any) => e.message).join(", ")
      : "Failed to create job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
console.log("API HIT: /api/jobs");