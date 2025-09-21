// app/api/employer/delete-document/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Employer from "@/models/Employee";

export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { employerId, documentUrl } = await req.json();

    if (!employerId || !documentUrl) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { $pull: { documents: { url: documentUrl } } },
      { new: true }
    );

    return NextResponse.json({ success: true, employer });
  } catch (err) {
    console.error("Delete document error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 });
  }
}
