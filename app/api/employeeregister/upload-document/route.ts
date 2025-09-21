
// app/api/employer/upload-document/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { connectedToDatabase } from "@/lib/db";
import Employer from "@/models/Employee"; // ✅ correct model

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();

    const formData = await req.formData();
    const files = formData.getAll("files") as File[]; // get multiple files
    const employerId = formData.get("employerId")?.toString();

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    if (!employerId) {
      return NextResponse.json({ success: false, error: "Employer ID is required" }, { status: 400 });
    }

    const uploadedDocs = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: `${employerId}_document_${Date.now()}_${file.name}`,
      });

      uploadedDocs.push({ name: file.name, url: uploadResult.url, uploadedAt: new Date() });
    }

    // Save all uploaded documents at once
    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { $push: { documents: { $each: uploadedDocs } } },
      { new: true }
    );

    return NextResponse.json({ success: true, employer });
  } catch (err) {
    console.error("Upload documents error:", err);
    return NextResponse.json({ success: false, error: "Failed to upload documents" }, { status: 500 });
  }
}
