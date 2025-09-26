// app/api/adminjobs/fetchapplication/[id]/route.ts

export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Application from "@/models/Application";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// ---------- GET SINGLE APPLICATION ----------
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);
if (!session || !["admin","superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 });
    }

    const application = await Application.findById(id).populate(
      "jobId",
      "title company location deadline"
    )
    .populate("userId","first and last name")

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (err) {
    console.error("Admin get application error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch application" }, { status: 500 });
  }
}

// ---------- UPDATE APPLICATION STATUS ----------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    // ✅ Allow only admin
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    const { id } = params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 });
    }

    // ✅ Extract fields from request body
    const body = await req.json();
    const { status, shortlisted } = body;

    // ✅ Build dynamic update object
    const updates: any = {};

    if (status) {
      if (!["Pending", "Interview", "Rejected", "Accepted","Shortlisted"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
    }

    if (typeof shortlisted === "boolean") {
      updates.shortlisted = shortlisted;
    }

    // ✅ No valid updates sent
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    // ✅ Update application in DB
    const updatedApp = await Application.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedApp) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err) {
    console.error("Admin update application error:", err);
    return NextResponse.json({ success: false, error: "Failed to update application" }, { status: 500 });
  }
}

// ---------- DELETE APPLICATION ----------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 });
    }

    const deletedApp = await Application.findByIdAndDelete(id);

    if (!deletedApp) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Application deleted" });
  } catch (err) {
    console.error("Admin delete application error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete application" }, { status: 500 });
  }
}
