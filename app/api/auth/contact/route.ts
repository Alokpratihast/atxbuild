import { NextResponse } from "next/server";
import nodemailer from "nodemailer";


export const dynamic = "force-dynamic"
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, service, projectDescription, updates } = body;

    if (!firstName || !email) {
      return NextResponse.json({ error: "First name and email are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "a749986abb35d0",
        pass: "0dc22125a080d3",
      },
    });

    await transporter.sendMail({
      // from: '"ATX Technologies" <no-reply@atx.com>', // ✅ always use your domain/mailtrap sender
      to: "to@example.com",
      subject: `New Contact Request from ${firstName}`,
      text: `
        Name: ${firstName} ${lastName}
        Email: ${email}
        Phone: ${phone}
        Service: ${service}
        Project: ${projectDescription}
        Updates: ${updates ? "Yes" : "No"}
      `,
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
