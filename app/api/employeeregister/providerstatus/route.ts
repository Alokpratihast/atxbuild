// app/api/employeeregister/providerstatus/route.ts

import { NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import ProviderVerification from "@/models/ProviderVerification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ verified: false }, { status: 401 });
    }

    const verification = await ProviderVerification.findOne({ contactEmail: session.user.email })
      .sort({ createdAt: -1 });

    if (!verification || verification.status !== "approved") {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error checking verification:", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
