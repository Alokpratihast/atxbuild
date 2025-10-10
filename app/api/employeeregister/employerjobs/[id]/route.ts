// api/employeeregister/employerjobs/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Job from "@/models/employerjobmodel";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Validate request body for updating/creating jobs.
 */
function validateJobInput(body: any) {
  const errors: string[] = [];

  if (!body.title) errors.push("Title is required");
  if (!body.description) errors.push("Description is required");
  if (!body.location) errors.push("Location is required");
  if (!body.company) errors.push("Company is required");
  if (body.salaryMin && isNaN(Number(body.salaryMin)))
    errors.push("salaryMin must be a number");
  if (body.salaryMax && isNaN(Number(body.salaryMax)))
    errors.push("salaryMax must be a number");
  if (body.totalExperience && isNaN(Number(body.totalExperience)))
    errors.push("totalExperience must be a number");

  if (
    body.salaryMin !== undefined &&
    body.salaryMax !== undefined &&
    Number(body.salaryMin) > Number(body.salaryMax)
  ) {
    errors.push("Minimum salary cannot exceed maximum salary");
  }

  return errors;
}

/**
 * GET /api/adminjobs/[id]
 * Fetch a single job by ID (only employer who created it).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !["employer"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Only allow employer to see their own job
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - not your job" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (err) {
    console.error("GET job error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/adminjobs/[id]
 * Update full job details (only employer who created it).
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !["employer"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });
    }

    const body = await req.json();
    const validationErrors = validateJobInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ success: false, errors: validationErrors }, { status: 400 });
    }

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
 * PATCH /api/adminjobs/[id]
 * Update partial job fields (isActive, status).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !["employer"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });
    }

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
 * DELETE /api/adminjobs/[id]
 * Delete a job (only employer who created it).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !["employer"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden - not your job" }, { status: 403 });
    }

    await Job.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (err) {
    console.error("DELETE job error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
