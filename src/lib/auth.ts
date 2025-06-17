import NextAuth from 'next-auth'
import { authOptions } from './authOptions'

// handler do App Router API
const nextAuthHandler = NextAuth(authOptions)

// helper do pobierania sesji w Server Components / page.tsx
export const auth = nextAuthHandler.auth

export default nextAuthHandler
