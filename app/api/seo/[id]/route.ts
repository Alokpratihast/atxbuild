export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import Seo from "@/models/seo-model";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectedToDatabase();
  const body = await req.json();
  const updated = await Seo.findByIdAndUpdate(params.id, body, { new: true });
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, seo: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectedToDatabase();
  const deleted = await Seo.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Deleted" });
}
