import { connectedToDatabase } from "@/lib/db";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";

export async function seedSuperAdmin() {
  try {
    await connectedToDatabase();

    // Read credentials from env
    const name = process.env.SUPERADMIN_NAME;
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.error(
        "Missing SUPERADMIN_NAME, SUPERADMIN_EMAIL, or SUPERADMIN_PASSWORD in env"
      );
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1️⃣ Check if a superadmin already exists
    let superAdmin = await Admin.findOne({ role: "superadmin" });

    if (superAdmin) {
      // ✅ Update superadmin if credentials changed
      if (
        superAdmin.email !== email ||
        !(await bcrypt.compare(password, superAdmin.password))
      ) {
        superAdmin.name = name;
        superAdmin.email = email;
        superAdmin.password = hashedPassword;
        await superAdmin.save();
        console.log("Superadmin updated:", email);
      } else {
        console.log("Superadmin already up-to-date:", email);
      }
      return;
    }

    // 2️⃣ If no superadmin exists, check if email exists in DB
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      // Upgrade existing admin to superadmin
      emailExists.name = name;
      emailExists.password = hashedPassword;
      emailExists.role = "superadmin";
      await emailExists.save();
      console.log("Existing admin upgraded to superadmin:", email);
      return;
    }

    // 3️⃣ Create superadmin if none exists
    superAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
    });
    console.log("Superadmin created:", email);
  } catch (error) {
    console.error("Error creating/updating superadmin:", error);
  }
}
