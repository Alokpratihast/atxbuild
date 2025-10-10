import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import ProviderVerification from "@/models/ProviderVerification";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Received verification POST request");

    await connectedToDatabase();
    console.log("[DB] Connected successfully");

    const formData = await req.formData();
    console.log("[API] Parsed formData keys:", Array.from(formData.keys()));

    const providerType = formData.get("providerType") as string;
    const contactName = formData.get("contactName") as string;
    const contactEmail = formData.get("contactEmail") as string;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filesToSave = [
      "companyRegDoc",
      "gstOrPan",
      "addressProof",
      "authorizedPersonId",
      "experienceLetter",
    ];

    const savedFiles: Record<string, string | null> = {};
    for (const key of filesToSave) {
      const file = formData.get(key);
      if (file && file instanceof File) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        savedFiles[key] = `/uploads/${filename}`;
      } else {
        savedFiles[key] = null;
      }
    }

    const newVerification = new ProviderVerification({
      providerType,
      contactName,
      contactEmail,
      documents: savedFiles,
      status: "pending",
      createdAt: new Date(),
    });

    console.log("[DB] Saving document:", newVerification);

    const savedDoc = await newVerification.save();
    console.log("[DB] Saved successfully:", savedDoc._id);

    return NextResponse.json(
      { message: "Documents submitted successfully", id: savedDoc._id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verification upload error:", error);
    return NextResponse.json(
      { message: error.message || "Server error while uploading" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectedToDatabase();
  const documents = await ProviderVerification.find({}).sort({ createdAt: -1 });
  return NextResponse.json(documents);
}