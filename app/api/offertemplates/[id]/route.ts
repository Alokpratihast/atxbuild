// app/api/offertemplates/[id]/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import OfferTemplate from "@/models/OfferTemplate";
import { connectedToDatabase } from "@/lib/db";


// * GET a single template by ID

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const template = await OfferTemplate.findById(params.id);
    if (!template)
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}


 //* PATCH update template by ID

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const body = await req.json();
    
    const updated = await OfferTemplate.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    if (!updated)
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update template" },
      { status: 500 }
    );
  }
}


 //* DELETE template by ID
 
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectedToDatabase();
    const deleted = await OfferTemplate.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
