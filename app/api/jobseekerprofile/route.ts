export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import JobSeeker from "@/models/jobseeker";
import { connectedToDatabase } from "@/lib/db";
import ImageKit from "imagekit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// ✅ GET profile (securely via session)
export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid User ID" }, { status: 400 });
    }

    // ✅ Fetch all fields you need (include skills & experience)
    const jobSeeker = await JobSeeker.findById(userId).select(
      "firstName lastName email contactNumber coverLetter resume skills experience dob location currentProfile totalExperience relevantExperience currentCTC expectedCTC workPreference noticePeriod"
    );

    if (!jobSeeker) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // ✅ Ensure skills & experience are arrays (parse if string)
    const safeJobSeeker = jobSeeker.toObject();
    safeJobSeeker.skills =
      typeof safeJobSeeker.skills === "string"
        ? JSON.parse(safeJobSeeker.skills || "[]")
        : safeJobSeeker.skills || [];
    safeJobSeeker.experience =
      typeof safeJobSeeker.experience === "string"
        ? JSON.parse(safeJobSeeker.experience || "[]")
        : safeJobSeeker.experience || [];

    return NextResponse.json({ success: true, jobSeeker: safeJobSeeker });
  } catch (err) {
    console.error("GET profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

// ✅ PUT profile (update or create)
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid User ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const fields = [
      "firstName", "lastName", "location", "contactNumber", "email",
      "dob", "currentProfile", "totalExperience", "relevantExperience",
      "currentCTC", "expectedCTC", "workPreference", "noticePeriod",
      "skills", "experience", "coverLetter"
    ];

    const updateData: any = {};

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value) {
        if (field === "skills" || field === "experience") {
          try {
            updateData[field] = JSON.parse(value.toString());
          } catch {
            updateData[field] = [];
          }
        } else {
          updateData[field] = value.toString();
        }
      }
    });

    if (updateData.dob) updateData.dob = new Date(updateData.dob);

    // ✅ Handle resume upload via ImageKit
    const resumeFile = formData.get("resume") as File | null;
    if (resumeFile && resumeFile.name) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: `${userId}_resume_${Date.now()}_${resumeFile.name}`,
      });
      updateData.resume = uploadResult.url;
    }

    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, upsert: true }
    );

    // ✅ Always send arrays in the response
    const safeJobSeeker = jobSeeker.toObject();
    safeJobSeeker.skills =
      typeof safeJobSeeker.skills === "string"
        ? JSON.parse(safeJobSeeker.skills || "[]")
        : safeJobSeeker.skills || [];
    safeJobSeeker.experience =
      typeof safeJobSeeker.experience === "string"
        ? JSON.parse(safeJobSeeker.experience || "[]")
        : safeJobSeeker.experience || [];

    return NextResponse.json({ success: true, jobSeeker: safeJobSeeker });
  } catch (err) {
    console.error("PUT profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
