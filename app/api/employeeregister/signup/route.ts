
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Employer from "@/models/Employee";
import { connectedToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();

    const { companyName, industry, location, contactNumber, email, password } = await req.json();

    // Validate input
    if (!companyName || !industry || !location || !contactNumber || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if employer already exists
    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer) {
      return NextResponse.json({ error: "Employer already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employer
    const employer = new Employer({
      companyName,
      industry,
      location,
      contactNumber,
      email,
      password: hashedPassword,
      role: "employer",
    });

    await employer.save();

    return NextResponse.json(
      { message: "Employer registered successfully!", employerId: employer._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Employer signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
console.log("API HIT: /api/employregister");