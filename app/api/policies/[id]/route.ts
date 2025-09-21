
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Policy from "@/models/plocicy";

// PATCH: update policy
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const { id } = params;
    const body = await req.json();

    const updated = await Policy.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, policy: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to update policy" }, { status: 500 });
  }
}

// DELETE: remove policy
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectedToDatabase();
    const { id } = params;

    const deleted = await Policy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Policy deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to delete policy" }, { status: 500 });
  }
}
