export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import ProviderVerification from "@/models/ProviderVerification";

export async function PATCH(req: NextRequest) {
  try {
    await connectedToDatabase();

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: "Missing id or status" }, { status: 400 });
    }

    const updated = await ProviderVerification.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Document status updated to ${status}`,
      updated,
    });
  } catch (error: any) {
    console.error("Error updating status:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}




// Add GET route in same file
export async function GET() {
  try {
    await connectedToDatabase();

    const allDocs = await ProviderVerification.find({}).sort({ createdAt: -1 });

    return NextResponse.json(allDocs);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
