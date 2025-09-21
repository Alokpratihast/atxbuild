
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server";
import Policy from "@/models/plocicy";
import { connectedToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// ------------------ GET /api/admin/policies ------------------
export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
   
    if (!session || !["admin","superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

    const policies = await Policy.find().sort({ createdAt: -1 }); // latest first
    return NextResponse.json({ success: true, policies });
  } catch (err) {
    console.error("GET policies error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch policies" }, { status: 500 });
  }
}

// ------------------ POST /api/admin/policies ------------------
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}


    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 });
    }

    const newPolicy = await Policy.create({ title, content });
    return NextResponse.json({ success: true, policy: newPolicy });
  } catch (err: any) {
    console.error("POST policy error:", err);
    const message = err.errors
      ? Object.values(err.errors).map((e: any) => e.message).join(", ")
      : "Failed to create policy";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
console.log("API HIT: /api/policies");