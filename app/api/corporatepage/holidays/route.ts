export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Holiday from "@/models/corporagepagemodel/Holiday";
import { connectedToDatabase } from "@/lib/db";

// ✅ GET all holidays
export async function GET() {
  try {
    await connectedToDatabase();
    const holidays = await Holiday.find().sort({ date: 1 });
    return NextResponse.json({ success: true, data: holidays });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch holidays" }, { status: 500 });
  }
}

// ✅ POST new holiday
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();

    if (!body.name || !body.date) {
      return NextResponse.json({ success: false, error: "Name and Date required" }, { status: 400 });
    }

    const holiday = new Holiday(body);
    await holiday.save();

    return NextResponse.json({ success: true, data: holiday });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add holiday" }, { status: 500 });
  }
}

// ✅ UPDATE holiday
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id, ...updateData } = await req.json();

    const updatedHoliday = await Holiday.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedHoliday) {
      return NextResponse.json({ success: false, error: "Holiday not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedHoliday });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update holiday" }, { status: 500 });
  }
}

// ✅ DELETE holiday
export async function DELETE(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id } = await req.json();

    const deletedHoliday = await Holiday.findByIdAndDelete(id);

    if (!deletedHoliday) {
      return NextResponse.json({ success: false, error: "Holiday not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete holiday" }, { status: 500 });
  }
}
