export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import OfferTemplate, { IOfferTemplate } from "@/models/OfferTemplate";
import { connectedToDatabase } from "@/lib/db";

// * GET all templates
export async function GET() {
  try {
    await connectedToDatabase();
    const templates: IOfferTemplate[] = await OfferTemplate.find();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// * CREATE new template
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();

    if (!body.role || !body.content) {
      return NextResponse.json(
        { success: false, error: "Role and content are required" },
        { status: 400 }
      );
    }

    const newTemplate = await OfferTemplate.create(body);
    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    );
  }
}
