
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import Application from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// ---------- UPDATE APPLICATION ----------
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const coverLetter = formData.get("coverLetter")?.toString() || "";
    const status = formData.get("status")?.toString();
    const resumeFile = formData.get("resume") as File | null;

    // ---------- Save new Resume (optional) ----------
    let resumePath: string | undefined;
    if (resumeFile) {
      const uploadsDir = path.join(process.cwd(), "public/uploads/resumes");
      if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, resumeFile.name);
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      resumePath = `/uploads/resumes/${resumeFile.name}`;
    }

    // ---------- Update Application ----------
    const updatedApp = await Application.findByIdAndUpdate(
      id,
      {
        ...(coverLetter && { coverLetter }),
        ...(status && { status }),
        ...(resumePath && { resume: resumePath }),
      },
      { new: true }
    );

    if (!updatedApp) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err) {
    console.error("Update application error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// ---------- DELETE APPLICATION ----------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Application deleted" });
  } catch (err) {
    console.error("Delete application error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
