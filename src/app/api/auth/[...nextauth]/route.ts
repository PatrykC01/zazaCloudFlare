import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "edge";

// Eksportuj funkcje GET i POST zgodnie z wymaganiami Next.js App Router
export async function GET(request: Request) {
  // @ts-ignore
  return NextAuth(authOptions)(request);
}

export async function POST(request: Request) {
  // @ts-ignore
  return NextAuth(authOptions)(request);
}
