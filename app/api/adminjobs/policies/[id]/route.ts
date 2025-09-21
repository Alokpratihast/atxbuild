export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import Policy from "@/models/plocicy";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ------------------ GET /api/admin/policies/[id] ------------------
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();

    const session= await getServerSession(authOptions)

    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    const policy = await Policy.findById(params.id);
    if (!policy) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, policy });
  } catch (err) {
    console.error("GET single policy error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch policy" }, { status: 500 });
  }
}

// ------------------ PATCH /api/admin/policies/[id] ------------------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    const body = await req.json();
    const updateData: Partial<{ title: string; content: string }> = {};

    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;

    const updatedPolicy = await Policy.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updatedPolicy) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, policy: updatedPolicy });
  } catch (err) {
    console.error("PATCH policy error:", err);
    return NextResponse.json({ success: false, error: "Failed to update policy" }, { status: 500 });
  }
}

// ------------------ DELETE /api/admin/policies/[id] ------------------
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


    const deletedPolicy = await Policy.findByIdAndDelete(params.id);
    if (!deletedPolicy) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Policy deleted" });
  } catch (err) {
    console.error("DELETE policy error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete policy" }, { status: 500 });
  }
}
