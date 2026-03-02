import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TOKEN_SECRET =
  process.env.TOKEN_SECRET || "behindcg-secret-key-change-me";
const COOKIE_NAME = "admin_token";

/* ── Rate limiting (in-memory; resets on server restart) ── */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (WINDOW_MS - (now - record.lastAttempt)) / 1000,
    );
    return { allowed: false, retryAfter };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true };
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

/* ── Token generation & verification ── */
export function generateToken(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [timestamp, nonce, signature] = parts;
  const payload = `${timestamp}:${nonce}`;
  const expected = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyPassword(password: string): boolean {
  // Constant-time comparison to prevent timing attacks
  const pwBuf = Buffer.from(password);
  const adminBuf = Buffer.from(ADMIN_PASSWORD);
  if (pwBuf.length !== adminBuf.length) return false;
  return crypto.timingSafeEqual(pwBuf, adminBuf);
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  if (!token?.value) return false;
  return verifyToken(token.value);
}
