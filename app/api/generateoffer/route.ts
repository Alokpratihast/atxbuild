// app/api/generate-offer/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import OfferTemplate from "@/models/OfferTemplate";
import { connectedToDatabase } from "@/lib/db";
import { fillTemplate } from "@/lib/fillTemplate";
import puppeteer from "puppeteer";

// Define the expected request body type
interface GenerateOfferBody {
  templateId: string;
  candidateName: string;
  jobTitle: string;
  joiningDate: string;
  companyName: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateOfferBody = await req.json();
    const { templateId, candidateName, jobTitle, joiningDate, companyName } = body;

    if (!templateId || !candidateName || !jobTitle || !joiningDate || !companyName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectedToDatabase();

    // Fetch the template from DB
    const template = await OfferTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Use fillTemplate instead of Handlebars
    const html = fillTemplate(template.content, {
      candidateName,
      jobTitle,
      joiningDate,
      companyName,
      role: template.role,
    });

    // Convert HTML → PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfUint8Array = await page.pdf({ format: "A4" });
    await browser.close();

    // Convert Uint8Array → Buffer
    const buffer = Buffer.from(pdfUint8Array);

    // Return PDF as response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=offer-letter.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating offer letter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate offer letter" },
      { status: 500 }
    );
  }
}

// app/api/offertemplates/route.ts
export async function GET(req: NextRequest) {
  await connectedToDatabase();
  const templates = await OfferTemplate.find();
  return NextResponse.json({ success: true, templates });
}
