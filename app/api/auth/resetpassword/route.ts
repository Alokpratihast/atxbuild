import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectedToDatabase } from "@/lib/db";
import JobSeeker from "@/models/jobseeker";
import Token from "@/models/passToken";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectedToDatabase();
    const { userId, token, password } = await req.json();

    if (!userId || !token || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const tokenDoc = await Token.findOne({ userId });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: "Token not found" },
        { status: 404 }
      );
    }

    // Check if token expired
    if (tokenDoc.expiresAt < new Date()) {
      await Token.deleteMany({ userId }); // Clean up expired tokens
      return NextResponse.json(
        { success: false, message: "Token expired" },
        { status: 400 }
      );
    }

    // Verify token validity
    const isValid = await bcrypt.compare(token, tokenDoc.tokenHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    await JobSeeker.findByIdAndUpdate(userId, { password: hashedPassword });

    // Clean up used token(s)
    await Token.deleteMany({ userId });

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
