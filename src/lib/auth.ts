// src/lib/auth.ts
import NextAuth from 'next-auth'
import { authOptions } from './authOptions'
import { getServerSession } from 'next-auth/next'

// dla /api/auth/[...nextauth]/route.ts
export const handlers = NextAuth(authOptions)

// helper do pobierania sesji w `page.tsx`
export async function auth() {
  return await getServerSession(authOptions)
}
