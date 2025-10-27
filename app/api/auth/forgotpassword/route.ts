import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { connectedToDatabase } from "@/lib/db";
import JobSeeker from "@/models/jobseeker";
import Token from "@/models/passToken";

const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await connectedToDatabase();
  const { email } = await req.json();

  const user = await JobSeeker.findOne({ email });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  // 🧹 Remove old tokens
  await Token.deleteMany({ userId: user._id });

  // 🔑 Generate a new token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);

  // 💾 Save token (expires in 10 min)
  await Token.create({
    userId: user._id,
    tokenHash: hashedToken,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // 🌐 Full reset URL
  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const resetLink = `${baseUrl}/resetpassword?token=${rawToken}&id=${user._id}`;

  // 📧 Send email
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"nodemailer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" 
           style="background:#4f46e5;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:6px;display:inline-block;">
          Reset Password
        </a>
        <p>This link expires in <b>10 minutes</b>.</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Reset link sent to your email" });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, message: "Email failed to send" }, { status: 500 });
  }
}
