import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  isAuthenticated,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

function getClientIP(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateCheck.retryAfter}s` },
        { status: 429 },
      );
    }

    const { password } = await req.json();
    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Successful login — reset rate limit
    resetRateLimit(ip);
    const token = generateToken();
    await setAuthCookie(token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
