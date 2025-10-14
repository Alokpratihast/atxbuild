import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Employer from "@/models/Employee"; // make sure path is correct

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    await connectedToDatabase();

    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "documentId is required" },
        { status: 400 }
      );
    }

    // Find the employer that has this document and remove it
    const employer = await Employer.findOneAndUpdate(
      { "documents._id": documentId },
      { $pull: { documents: { _id: documentId } } },
      { new: true }
    );

    if (!employer) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
