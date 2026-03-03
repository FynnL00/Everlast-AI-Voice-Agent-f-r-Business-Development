import { NextResponse, type NextRequest } from "next/server";

// In-memory rate limiter for expensive API routes (briefing)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per window

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export function middleware(request: NextRequest) {
  // Rate limit the briefing API (expensive OpenRouter calls)
  if (request.nextUrl.pathname.includes("/briefing")) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(`briefing:${ip}`)) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warten Sie eine Minute." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon).*)"],
};
