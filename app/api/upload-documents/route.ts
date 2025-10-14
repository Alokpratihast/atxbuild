import { NextRequest, NextResponse } from "next/server";
import { connectedToDatabase } from "@/lib/db";
import ProviderVerification from "@/models/ProviderVerification";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    console.log("[DB] Connected successfully");

    const formData = await req.formData();
    console.log("[API] Received keys:", Array.from(formData.keys()));

    // Extract basic fields
    const providerType = formData.get("providerType") as string;
    const contactName = formData.get("contactName") as string;
    const contactEmail = formData.get("contactEmail") as string;

    // Prepare uploads folder
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Define all possible file keys
    const fileKeys = [
      "companyRegDoc",
      "gstOrPan",
      "addressProof",
      "authorizedPersonId",
      "experienceLetter",
    ];

    // Save files locally
    const savedFiles: Record<string, string | null> = {};
    for (const key of fileKeys) {
      const file = formData.get(key);
      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        savedFiles[key] = `/uploads/${filename}`; // URL for browser access
        console.log(`[UPLOAD] Saved ${key} -> ${filepath}`);
      } else {
        savedFiles[key] = null;
      }
    }

    // Save document to MongoDB
    const newDoc = new ProviderVerification({
      providerType,
      contactName,
      contactEmail,
      documents: savedFiles,
      status: "pending",
      createdAt: new Date(),
    });

    const savedDoc = await newDoc.save();
    console.log("[DB] Saved document:", savedDoc._id);

    return NextResponse.json({
      message: "Documents submitted successfully",
      id: savedDoc._id,
      documents: savedFiles,
    });
  } catch (error: any) {
    console.error("[ERROR] Upload failed:", error);
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}

// GET route for admin to fetch all provider documents
export async function GET() {
  try {
    await connectedToDatabase();
    const docs = await ProviderVerification.find({}).sort({ createdAt: -1 });
    return NextResponse.json(docs);
  } catch (err: any) {
    console.error("[ERROR] Fetching documents failed:", err);
    return NextResponse.json({ message: "Failed to fetch documents" }, { status: 500 });
  }
}
