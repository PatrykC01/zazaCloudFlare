// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const runtime = "edge"

// zamiast oddzielnych GET/POST, po prostu:
export default handlers
