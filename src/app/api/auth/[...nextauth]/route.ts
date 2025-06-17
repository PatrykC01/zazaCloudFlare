// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const runtime = "edge"
export const GET  = handlers
export const POST = handlers
