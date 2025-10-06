// app/api/generate-offer/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import OfferTemplate from "@/models/OfferTemplate";
import { connectedToDatabase } from "@/lib/db";
import { fillTemplate } from "@/lib/fillTemplate";
import puppeteer from "puppeteer";

// Expected request body
interface GenerateOfferBody {
  templateId: string;
  candidateName: string;
  jobTitle: string;
  joiningDate: string;
  companyName: string;
  internshipDuration?: string;
  stipendAmount?: string;
  confirmationPeriod?: string;
  hrname?: string;
  companyAddress?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateOfferBody = await req.json();
    let {
      templateId,
      candidateName,
      jobTitle,
      joiningDate,
      companyName,
      internshipDuration,
      stipendAmount,
      confirmationPeriod,
      hrname,
      companyAddress,
    } = body;

    // Basic required fields
    if (!templateId || !candidateName || !jobTitle || !joiningDate || !companyName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Default optional fields
    hrname ||= "HR Team";
    companyAddress ||= "Company Address";

    // Conditional validation
    if (jobTitle.toLowerCase().includes("intern") && (!internshipDuration || !stipendAmount)) {
      return NextResponse.json({ success: false, error: "Missing internship details" }, { status: 400 });
    }
    if (jobTitle.toLowerCase().includes("probation") && !confirmationPeriod) {
      return NextResponse.json({ success: false, error: "Missing probation period" }, { status: 400 });
    }

    await connectedToDatabase();

    // Fetch template
    const template = await OfferTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Fill template with defaults
    const html = fillTemplate(template.content, {
      candidateName,
      jobTitle,
      joiningDate,
      companyName,
      role: template.role,
      internshipDuration: internshipDuration || "N/A",
      stipendAmount: stipendAmount || "N/A",
      confirmationPeriod: confirmationPeriod || "N/A",
      hrname,
      companyAddress,
    });

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();
    

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${candidateName}-Offer-Letter.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating offer letter:", error);
    return NextResponse.json({ success: false, error: "Failed to generate offer letter" }, { status: 500 });
  }
}
