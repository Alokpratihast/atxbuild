// /app/api/jobseekers/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import JobSeeker from "@/models/jobseeker";
import { connectedToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();

    const formData = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      dob,
      location,
      currentProfile,
      totalExperience,
      relevantExperience,
      currentCTC,
      expectedCTC,
      workPreference,
      noticePeriod,
      skills,
      experience,
      resume,
      coverLetter,
    } = formData;

    // ✅ Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check email uniqueness
    const existing = await JobSeeker.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save to DB
    const newJobSeeker = await JobSeeker.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      dob: dob ? new Date(dob) : null,
      location,
      currentProfile,
      totalExperience,
      relevantExperience,
      currentCTC,
      expectedCTC,
      workPreference,
      noticePeriod,
      skills,
      experience,
      resume: resume || "",
      coverLetter: coverLetter || "",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newJobSeeker.userId.toString(),
        firstName: newJobSeeker.firstName,
        lastName: newJobSeeker.lastName,
        email: newJobSeeker.email,
      },
    });
  } catch (error) {
    console.error("JobSeeker POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save job seeker" },
      { status: 500 }
    );
  }
}
