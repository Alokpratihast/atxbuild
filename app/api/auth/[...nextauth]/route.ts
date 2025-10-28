// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";  // ✅ Fix: match filename
import {seedSuperAdmin} from "@/lib/seedSuperAdmin";


// Run the superadmin seed check once on startup
seedSuperAdmin()
  .then(() => console.log("✅ Superadmin verified or created"))
  .catch((err: any) => console.error("❌ Error ensuring superadmin:", err));
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
