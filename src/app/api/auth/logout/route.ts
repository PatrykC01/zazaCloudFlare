// src/app/api/auth/logout/route.ts
export const runtime = "edge";

import { NextResponse } from "next/server";

export async function POST() {
  // Clear the admin_session cookie
  const res = NextResponse.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  return res;
}
