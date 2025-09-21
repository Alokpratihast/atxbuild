// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Create a response to return
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear all NextAuth session cookies
  response.cookies.set({
    name: "next-auth.session-token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set({
    name: "__Secure-next-auth.session-token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  // Optional: clear CSRF cookie (if using)
  response.cookies.set({
    name: "next-auth.csrf-token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
