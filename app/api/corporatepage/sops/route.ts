export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import SOP from "@/models/corporagepagemodel/Sop";
import { connectedToDatabase } from "@/lib/db";

// GET all SOPs / Training / Resources
export async function GET() {
  try {
    await connectedToDatabase();
    const items = await SOP.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST add new item
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();

    if (!body.title || !body.category || !body.fileUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const item = new SOP(body);
    await item.save();

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add item" }, { status: 500 });
  }
}

// PUT update an item
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id, ...updateData } = await req.json();

    const updatedItem = await SOP.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE an item
export async function DELETE(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id } = await req.json();

    const deletedItem = await SOP.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 });
  }
}
