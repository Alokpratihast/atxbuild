// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";

export function middleware(req: NextRequest) {
  // Only apply rate limit to /api routes
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";

  const { allowed } = rateLimit(ip);

  if (!allowed) {
    console.warn(`[RateLimit] Blocked IP: ${ip}`);
    return new NextResponse("Too many requests, please try again later.", {
      status: 429,
      headers: {
        "Retry-After": "60", // optional: tells browser to retry after 60s
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
