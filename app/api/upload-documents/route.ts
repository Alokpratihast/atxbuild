export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Example: save first file (expand for multiple)
    const educationCert = formData.get("educationCert") as File | null;
    const govtId = formData.get("govtId") as File | null;
    const experienceLetter = formData.get("experienceLetter") as File | null;

    const uploads: string[] = [];

    async function saveFile(file: File, name: string) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);

      await writeFile(filePath, buffer);
      uploads.push(`/uploads/${path.basename(filePath)}`);
    }

    if (educationCert) await saveFile(educationCert, "educationCert");
    if (govtId) await saveFile(govtId, "govtId");
    if (experienceLetter) await saveFile(experienceLetter, "experienceLetter");

    return NextResponse.json({
      success: true,
      message: "Files uploaded",
      files: uploads,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
