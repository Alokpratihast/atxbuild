// app/api/employeeregister/employerjobs/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Job from "@/models/employerjobmodel";
import ProviderVerification from "@/models/ProviderVerification";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Validate job input for PUT
 */
function validateJobInput(body: any) {
  const errors: string[] = [];
  if (!body.title) errors.push("Title is required");
  if (!body.description) errors.push("Description is required");
  if (!body.location) errors.push("Location is required");
  if (!body.company) errors.push("Company is required");
  if (body.salaryMin && isNaN(Number(body.salaryMin))) errors.push("salaryMin must be a number");
  if (body.salaryMax && isNaN(Number(body.salaryMax))) errors.push("salaryMax must be a number");
  if (body.totalExperience && isNaN(Number(body.totalExperience))) errors.push("totalExperience must be a number");
  if (body.salaryMin !== undefined && body.salaryMax !== undefined && Number(body.salaryMin) > Number(body.salaryMax))
    errors.push("Minimum salary cannot exceed maximum salary");
  return errors;
}

/**
 * GET job by ID
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });

    return NextResponse.json({ success: true, job });
  } catch (err) {
    console.error("GET job error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch job" }, { status: 500 });
  }
}

/**
 * PUT - Update full job (requires approved provider)
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check provider verification
    const verification = await ProviderVerification.findOne({ contactEmail: session.user.email }).sort({ createdAt: -1 });
    if (!verification || verification.status !== "approved") {
      return NextResponse.json({ success: false, error: "You can update jobs only after admin approval" }, { status: 403 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });

    const body = await req.json();
    const validationErrors = validateJobInput(body);
    if (validationErrors.length > 0) return NextResponse.json({ success: false, errors: validationErrors }, { status: 400 });

    // Parse skills
    let parsedSkills: string[] = [];
    if (body.skills !== undefined) {
      if (Array.isArray(body.skills)) parsedSkills = body.skills.map((s: string) => s.trim()).filter(Boolean);
      else if (typeof body.skills === "string") parsedSkills = body.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (parsedSkills.length === 0) return NextResponse.json({ success: false, error: "At least one skill is required" }, { status: 400 });
    }

    const parsedDeadline = body.deadline ? new Date(body.deadline) : undefined;
    if (parsedDeadline && isNaN(parsedDeadline.getTime())) return NextResponse.json({ success: false, error: "Invalid deadline date" }, { status: 400 });

    const updateData: any = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.company !== undefined && { company: body.company }),
      ...(body.salaryMin !== undefined && { salaryMin: Number(body.salaryMin) }),
      ...(body.salaryMax !== undefined && { salaryMax: Number(body.salaryMax) }),
      ...(body.totalExperience !== undefined && { totalExperience: Number(body.totalExperience) }),
      ...(body.skills !== undefined && { skills: parsedSkills }),
      ...(body.availability !== undefined && { availability: body.availability }),
      ...(parsedDeadline !== undefined && { deadline: parsedDeadline }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    };

    const updatedJob = await Job.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true });
    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err: any) {
    console.error("PUT job error:", err);
    const message = err.errors ? Object.values(err.errors).map((e: any) => e.message).join(", ") : "Failed to update job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH - Partial update (isActive, status)
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check provider verification
    const verification = await ProviderVerification.findOne({ contactEmail: session.user.email }).sort({ createdAt: -1 });
    if (!verification || verification.status !== "approved") {
      return NextResponse.json({ success: false, error: "You can update jobs only after admin approval" }, { status: 403 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });

    const body = await req.json();
    const updateData: any = {};

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") return NextResponse.json({ error: "isActive must be true or false" }, { status: 400 });
      updateData.isActive = body.isActive;
    }

    if (body.status !== undefined) {
      const allowedStatus = ["pending", "approved", "rejected"];
      if (!allowedStatus.includes(body.status)) return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      updateData.status = body.status;
    }

    const updatedJob = await Job.findByIdAndUpdate(params.id, updateData, { new: true });
    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err) {
    console.error("PATCH job error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE - Delete a job
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });

    await Job.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (err) {
    console.error("DELETE job error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST - Create a new job (same logic as employerjob/route.ts)
 * Only needed if you want POST here instead of separate route
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

    const parsedSalaryMin = salaryMin !== undefined ? Number(salaryMin) : undefined;
    const parsedSalaryMax = salaryMax !== undefined ? Number(salaryMax) : undefined;
    const parsedTotalExperience = totalExperience !== undefined ? Number(totalExperience) : undefined;

    if (parsedSalaryMin !== undefined && parsedSalaryMax !== undefined && parsedSalaryMin > parsedSalaryMax) {
      return NextResponse.json({ success: false, error: "Minimum salary cannot exceed maximum salary" }, { status: 400 });
    }

    // Parse skills
    let parsedSkills: string[] = [];
    if (skills) {
      parsedSkills = Array.isArray(skills)
        ? skills.map((s: string) => s.trim()).filter(Boolean)
        : skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (parsedSkills.length === 0) return NextResponse.json({ success: false, error: "At least one skill is required" }, { status: 400 });

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) return NextResponse.json({ success: false, error: "Invalid deadline date" }, { status: 400 });

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
      isActive: false,
      createdBy: session.user.id,
      status: "pending",
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (err: any) {
    console.error("POST job error:", err);
    const message = err.errors ? Object.values(err.errors).map((e: any) => e.message).join(", ") : "Failed to create job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
