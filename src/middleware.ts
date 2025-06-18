// middleware.ts
export const runtime = "nodejs";

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    // Sprawdź czy użytkownik jest adminem
    if (
      pathname.startsWith("/adminPanel") &&
      (!token || token.role !== "admin")
    ) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/signin" },
  }
);

export const config = { matcher: ["/adminPanel/:path*"] };
