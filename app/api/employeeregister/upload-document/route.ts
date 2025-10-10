import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { connectedToDatabase } from "@/lib/db";
import Employer from "@/models/Employee"; // Your model
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // NextAuth options

export const dynamic = "force-dynamic";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    // Get current logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    await connectedToDatabase();

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });

    const uploadedDocs: any[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: `${userId}_document_${Date.now()}_${file.name}`,
      });
      uploadedDocs.push({
        name: file.name,
        url: uploadResult.url,
        uploadedAt: new Date(),
        status: "Pending",
      });
    }

    // Update user document array
    const user = await Employer.findByIdAndUpdate(
      userId,
      { $push: { documents: { $each: uploadedDocs } } },
      { new: true }
    );

    return NextResponse.json({ success: true, documents: user?.documents || [] });
  } catch (err) {
    console.error("Upload documents error:", err);
    return NextResponse.json({ success: false, error: "Failed to upload documents" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    await connectedToDatabase();

    const user = await Employer.findById(userId).select("documents");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json(user.documents);
  } catch (err) {
    console.error("Fetch documents error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}