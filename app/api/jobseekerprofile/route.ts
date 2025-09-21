export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import JobSeeker from "@/models/jobseeker";
import { connectedToDatabase } from "@/lib/db";
import ImageKit from "imagekit";



const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// GET profile by userId (client must send it via headers)
export async function GET(req: NextRequest) {
  try {
    await connectedToDatabase();

    // Get user ID from headers only
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ success: false, error: "Invalid User ID" }, { status: 400 });

    const jobSeeker = await JobSeeker.findById(userId);
    if (!jobSeeker) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    return NextResponse.json({ success: true, jobSeeker });
  } catch (err) {
    console.error("GET profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT profile: update existing or create new
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();

    const formData = await req.formData();
    const userId = formData.get("userId")?.toString();
    if (!userId) return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ success: false, error: "Invalid User ID" }, { status: 400 });

    const fields = [
      "firstName","lastName","location","contactNumber","email",
      "dob","currentProfile","totalExperience","relevantExperience",
      "currentCTC","expectedCTC","workPreference","noticePeriod",
      "skills","experience","coverLetter"
    ];

    const updateData: any = {};

    fields.forEach(field => {
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

    return NextResponse.json({ success: true, jobSeeker });
  } catch (err) {
    console.error("PUT profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
