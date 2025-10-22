// app/api/upload-image/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_SIZE = 20 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as any;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }

    const originalFileName = file.name || "image.png";
    const originalName = originalFileName.toLowerCase();
    const fileSize = file.size || 0;
    const fileType = file.type || "application/octet-stream";

    // Validate size
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Validate extension
    const ext = originalName.split(".").pop();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Invalid file type. Only images allowed." }, { status: 400 });
    }

    // Sanitize filename
    const safeFileName = originalName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const uniqueFileName = `blog_${Date.now()}_${safeFileName}`;

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${fileType};base64,${buffer.toString("base64")}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: uniqueFileName,
      folder: "/blog-images",
    });

    return NextResponse.json({
      url: uploadResponse.url,          // Direct URL for embedding
      fileName: uniqueFileName,
      originalFileName,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
