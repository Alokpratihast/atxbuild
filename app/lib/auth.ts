import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectedToDatabase } from "@/lib/db";
import JobSeeker from "@/models/jobseeker";
import Employer from "@/models/Employee";
import Admin from "@/models/admin";

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔹 JobSeeker Login
    CredentialsProvider({
      id: "jobseeker-login",
      name: "JobSeeker Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectedToDatabase();

        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const jobSeeker = await JobSeeker.findOne({ email: credentials.email });
        if (!jobSeeker) throw new Error("No jobseeker found");

        const isValid = await bcrypt.compare(
          credentials.password,
          jobSeeker.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: jobSeeker._id.toString(),
          email: jobSeeker.email,
          role: "jobseeker",
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
        } as User;
      },
    }),

    // 🔹 Employer Login
    CredentialsProvider({
      id: "employer-login",
      name: "Employer Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectedToDatabase();

        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const employer = await Employer.findOne({ email: credentials.email });
        if (!employer) throw new Error("No employer found");

        const isValid = await bcrypt.compare(
          credentials.password,
          employer.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: employer._id.toString(),
          email: employer.email,
          role: "employer",
          companyName: employer.companyName,
        } as User;
      },
    }),
    // 🔹 Admin Login//superadmin
CredentialsProvider({
  id: "admin-login",
  name: "Admin Login",
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    await connectedToDatabase();

    if (!credentials?.email || !credentials.password) {
      throw new Error("Missing email or password");
    }

    const adminUser = await Admin.findOne({ email: credentials.email });
    if (!adminUser) throw new Error("No admin found");

    const isValid = await bcrypt.compare(credentials.password, adminUser.password);
    if (!isValid) throw new Error("Invalid password");

    return {
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
    } as User;
  },
})

  

  ],

  // 🔹 Sessions use JWT
  session: { strategy: "jwt" },

  pages: {
    signIn: "/employerform/login", // optional: custom login page
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;

       if (user.role === "jobseeker") {
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
        } else if (user.role === "employer") {
          token.companyName = (user as any).companyName;
        } else if (user.role === "admin"|| user.role === "superadmin") {
          token.name = (user as any).name;
        }
      }
      return token;
    },

    async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.role = token.role as "jobseeker" | "employer" | "admin"|"superadmin";

          if (token.role === "jobseeker") {
            session.user.firstName = token.firstName as string;
            session.user.lastName = token.lastName as string;
          } else if (token.role === "employer") {
            session.user.companyName = token.companyName as string;
          } else if (token.role === "admin"|| token.role==="superadmin") {
            session.user.name = token.name as string;
          }
        }
      return session;
    },
    // secret:
  },

  

  secret: process.env.NEXTAUTH_SECRET,
};
