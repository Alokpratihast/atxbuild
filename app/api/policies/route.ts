
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Policy from "@/models/plocicy";

// GET: fetch all policies
export async function GET() {
  try {
    await connectedToDatabase();
    const policies = await Policy.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, policies });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

// POST: create new policy
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const policy = await Policy.create({ title, content });
    return NextResponse.json({ success: true, policy }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
