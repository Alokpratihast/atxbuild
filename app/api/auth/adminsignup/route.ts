export const dynamic = "force-dynamic"

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectedToDatabase } from "@/lib/db";
import Admin from "@/models/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Only superadmin can create new admins
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectedToDatabase();

    // Destructure role from request body
    const { name, email, password, role }: 
      { name: string; email: string; password: string; role?: "admin" | "superadmin" } = await req.json();

    // 1️⃣ Validate fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 2️⃣ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 3️⃣ Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 4️⃣ Check for existing admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6️⃣ Create admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role === "superadmin" ? "superadmin" : "admin", // ✅ fallback
    });

    // 7️⃣ Remove password before sending back
    const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

    return NextResponse.json(
      { message: "Admin registered successfully", user: adminWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
