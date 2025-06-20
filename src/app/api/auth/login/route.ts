// src/app/api/auth/login/route.ts
export const runtime = "edge";

import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/crypto";

// Helper: constant-time string comparison
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; ++i) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// JWT helpers (Edge-compatible, HS256)
async function signJWT(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const base64url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${data}.${sigB64}`;
}

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !ADMIN_JWT_SECRET) {
    return NextResponse.json(
      { message: "Brak konfiguracji admina." },
      { status: 500 }
    );
  }

  // PBKDF2: hash format is "salt:hash"
  const [salt, expectedHash] = ADMIN_PASSWORD_HASH.split(":");
  const isPasswordValid = verifyPassword(password, salt, expectedHash);

  if (!safeEqual(username, ADMIN_USERNAME) || !isPasswordValid) {
    return NextResponse.json(
      { message: "Nieprawidłowe dane logowania." },
      { status: 401 }
    );
  }

  // JWT payload: username, issued at, expires in 1 day
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    username,
    iat: now,
    exp: now + 60 * 60 * 24, // 1 day
    role: "admin",
  };
  const jwt = await signJWT(payload, ADMIN_JWT_SECRET);

  const res = NextResponse.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    `admin_session=${jwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
  return res;
}
