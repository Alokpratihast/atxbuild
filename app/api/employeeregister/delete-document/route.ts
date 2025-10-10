// app/api/employer/delete-document/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Employer from "@/models/Employee";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // your NextAuth options

export async function DELETE(req: NextRequest) {
  try {
    await connectedToDatabase();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employerId = session.user.id; // use session user ID

    // Get documentId from query parameters
    const url = new URL(req.url);
    const documentId = url.searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "documentId is required" },
        { status: 400 }
      );
    }

    // Remove document by its _id from employer's documents array
    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { $pull: { documents: { _id: documentId } } },
      { new: true }
    );

    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Employer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, employer });
  } catch (err) {
    console.error("Delete document error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
