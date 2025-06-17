import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const runtime = 'edge'

// Instancja handlera
const authHandler = NextAuth(authOptions)

/**
 * Next.js oczekuje, że GET/POST będą funkcjami:
 *   (request: Request) => Promise<Response>
 * Wywołamy authHandler przekazując mu Request.
 */
export async function GET(request: Request) {
  return authHandler(request)
}

export async function POST(request: Request) {
  return authHandler(request)
}
