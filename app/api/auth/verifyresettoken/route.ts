import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectedToDatabase } from "@/lib/db";
import Token from "@/models/passToken";

const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectedToDatabase();

    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing token or user ID" },
        { status: 400 }
      );
    }

    // 🔍 Find token entry for user
    const stored = await Token.findOne({ userId });

    if (!stored) {
      return NextResponse.json(
        { success: false, message: "No reset request found or token expired" },
        { status: 404 }
      );
    }

    // ⏰ Check expiry
    if (stored.expiresAt < new Date()) {
      await Token.deleteOne({ _id: stored._id });
      return NextResponse.json(
        { success: false, message: "Token expired" },
        { status: 410 } // Gone
      );
    }

    // 🔐 Compare raw token with stored hash
    const isMatch = await bcrypt.compare(token, stored.tokenHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 403 }
      );
    }

    // ✅ Valid token
    return NextResponse.json({ success: true, message: "Valid token" });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { success: false, message: "Server error verifying token" },
      { status: 500 }
    );
  }
}
