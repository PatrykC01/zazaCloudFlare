// middleware.ts
export const runtime = "edge";

import { NextResponse } from "next/server";

// JWT verify helper (Edge-compatible, HS256)
async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const encoder = new TextEncoder();
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return null;
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sig = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      encoder.encode(data)
    );
    if (!valid) return null;
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("admin_session");
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
  let isAdmin = false;
  if (session && ADMIN_JWT_SECRET) {
    const payload = await verifyJWT(session.value, ADMIN_JWT_SECRET);
    if (payload && payload.role === "admin") isAdmin = true;
  }
  if (pathname.startsWith("/adminPanel") && !isAdmin) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/adminPanel/:path*"] };
