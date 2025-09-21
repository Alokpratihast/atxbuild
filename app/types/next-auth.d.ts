import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "jobseeker" | "employer" | "admin"|"superadmin"; // ✅ added admin
      firstName?: string;   // JobSeeker only
      lastName?: string;    // JobSeeker only
      companyName?: string; // Employer only
      name?: string;        // Admin only
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    role: "jobseeker" | "employer" | "admin"|"superadmin"; // ✅ added admin
    firstName?: string;
    lastName?: string;
    companyName?: string;
    name?: string; // Admin only
  }

  interface JWT {
    id: string;
    email: string;
    role: "jobseeker" | "employer" | "admin"|"superadmin"; // ✅ added admin
    firstName?: string;
    lastName?: string;
    companyName?: string;
    name?: string; // Admin only
  }
}
