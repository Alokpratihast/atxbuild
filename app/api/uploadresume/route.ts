// // app/api/uploadresume/route.ts
// export const dynamic = "force-dynamic"
// import { NextResponse } from "next/server";
// import ImageKit from "imagekit";

// // Initialize ImageKit
// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
// });

// const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
// const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// export async function POST(req: Request) {
//   try {
//     const data = await req.formData();
//     console.log("FormData keys:", Array.from(data.keys()));

//     // Get file from FormData
//     const file = data.get("file") as any;

//     // Validate file
//     if (!file || typeof file.arrayBuffer !== "function") {
//       return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
//     }

//     const fileName = (file.name || "untitled").toLowerCase();
//     const fileSize = file.size || 0;
//     const fileType = file.type || "application/octet-stream";

//     console.log("Received file:", fileName, fileSize, fileType);

//     if (fileSize > MAX_SIZE) {
//       return NextResponse.json(
//         { error: "File is too large. Maximum size is 5MB." },
//         { status: 400 }
//       );
//     }

//     const ext = fileName.split(".").pop();
//     if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
//       return NextResponse.json(
//         { error: "Invalid file type. Only PDF or Word documents allowed." },
//         { status: 400 }
//       );
//     }

//     const safeFileName = fileName
//   .replace(/\s+/g, "_") // replaces spaces with underscores
//   .replace(/[^a-zA-Z0-9._-]/g, ""); // removes special chars


//     // Convert file to base64
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const base64File = `data:${fileType};base64,${buffer.toString("base64")}`;

//     // Upload to ImageKit
//     const uploadResponse = await imagekit.upload({
//       file: base64File,
//       fileName: `resume_${Date.now()}_${safeFileName}`,
//       folder: "/resumes",
//     });

//     return NextResponse.json({ url: uploadResponse.url });
//   } catch (error) {
//     console.error("Upload failed:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Upload failed" },
//       { status: 500 }
//     );
//   }
// }


// app/api/uploadresume/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB



export async function POST(req: Request) {
  try {
    const data = await req.formData();
    console.log("FormData keys:", Array.from(data.keys()));

    // Get file from FormData
    const file = data.get("file") as any;

    // Validate file
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }
    const originalFileName = file.name || "untitled.pdf"; // save the actual name
    const originalName = (file.name || "untitled").toLowerCase();
    const fileSize = file.size || 0;
    const fileType = file.type || "application/octet-stream";

    // Validate size
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = originalName.split(".").pop();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF or Word documents allowed." },
        { status: 400 }
      );
    }

    // Sanitize file name (remove spaces/special chars)
    const safeFileName = originalName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    // Generate unique filename with timestamp
    const uniqueFileName = `resume_${Date.now()}_${safeFileName}`;

    // Convert file to base64 for ImageKit
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${fileType};base64,${buffer.toString("base64")}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: uniqueFileName,
      folder: "/resumes",
    });

    // Return both view & download URLs
    return NextResponse.json({
      url: uploadResponse.url, // direct URL
      downloadUrl: uploadResponse.url, // can use same for <a download>
      fileName: uniqueFileName,
      originalFileName // for user-friendly download
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

