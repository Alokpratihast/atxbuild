
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Employee from "@/models/corporagepagemodel/Employee";
import { connectedToDatabase } from "@/lib/db";

// 📌 GET all employees
export async function GET() {
  try {
    await connectedToDatabase();
    const employees = await Employee.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

// 📌 POST add new employee
export async function POST(req: NextRequest) {
  try {
    await connectedToDatabase();
    const body = await req.json();

    if (!body.name || !body.dob || !body.title || !body.doj || !body.email || !body.department || !body.phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const employee = new Employee(body);
    await employee.save();

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add employee" }, { status: 500 });
  }
}

// ✅ UPDATE Employee
export async function PUT(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id, ...updateData } = await req.json();

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEmployee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee: updatedEmployee });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update employee" }, { status: 500 });
  }
}

// ✅ DELETE Employee
export async function DELETE(req: NextRequest) {
  try {
    await connectedToDatabase();
    const { id } = await req.json();

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete employee" }, { status: 500 });
  }
}
