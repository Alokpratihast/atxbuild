// api/adminjobs/[id]/route.ts
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import Job from "@/models/admin-model";
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
 * Fetch a single active job by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // If not admin (public/browse user), only allow active jobs
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    // Admin can see both active and inactive
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
 * Update job details (full update).
 * Only admin users can update jobs.
 */
// ---------------------------
// Update a job by ID (PUT)
// ---------------------------
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validation
    const validationErrors = validateJobInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ success: false, errors: validationErrors }, { status: 400 });
    }

    // Parse skills
    let parsedSkills: string[] = [];
    if (body.skills !== undefined) {
      if (Array.isArray(body.skills)) {
        parsedSkills = body.skills.map((s:String) => String(s).trim()).filter(Boolean);
      } else if (typeof body.skills === "string") {
        parsedSkills = body.skills.split(",").map((s:String) => s.trim()).filter(Boolean);
      }
      if (parsedSkills.length === 0) {
        return NextResponse.json({ success: false, error: "At least one skill is required" }, { status: 400 });
      }
    }

    // Parse deadline
    const parsedDeadline = body.deadline ? new Date(body.deadline) : undefined;
    if (parsedDeadline && isNaN(parsedDeadline.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid deadline date" }, { status: 400 });
    }

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

    if (!updatedJob) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err: any) {
    console.error("Error updating job:", err);
    const message = err.errors
      ? Object.values(err.errors).map((e: any) => e.message).join(", ")
      : "Failed to update job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}



 

// ------------------ PATCH ------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    await connectedToDatabase();
    const body = await req.json();

    const updateData: any = {};

    // allow toggling isActive
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be true or false" },
          { status: 400 }
        );
      }
      updateData.isActive = body.isActive;
    }

    // allow updating status
    if (body.status !== undefined) {
      const allowedStatus = ["pending", "approved", "rejected"];
      if (!allowedStatus.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    const updatedJob = await Job.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("PATCH /api/adminjobs/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



// ------------------ DELETE ------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
    }

    await connectedToDatabase();

    const deletedJob = await Job.findByIdAndDelete(params.id);

    if (!deletedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("DELETE /api/adminjobs/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}