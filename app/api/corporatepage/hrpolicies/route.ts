export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import HRPolicy from "@/models/corporagepagemodel/HRPolicy";
import { connectedToDatabase } from "@/lib/db";

// GET all HR Policies
export async function GET() {
  try {
    await connectedToDatabase();
    const policies = await HRPolicy.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch policies" }, { status: 500 });
  }
}

// POST add new HR policy
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const policy = new HRPolicy(body);
    await policy.save();

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add policy" }, { status: 500 });
  }
}

// PUT update HR policy
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id, ...updateData } = await req.json();

    const updatedPolicy = await HRPolicy.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPolicy) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPolicy });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update policy" }, { status: 500 });
  }
}

// DELETE HR policy
export async function DELETE(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id } = await req.json();

    const deletedPolicy = await HRPolicy.findByIdAndDelete(id);
    if (!deletedPolicy) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Policy deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete policy" }, { status: 500 });
  }
}
