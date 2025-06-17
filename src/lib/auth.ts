// poprzednio: import NextAuth from 'next-auth/next'
import NextAuth from 'next-auth'
import { authOptions } from './authOptions'

// Ta sama instancja, z której wyciągasz helpera:
const nextAuthHandler = NextAuth(authOptions)

// Helper do pobierania sesji w Server Components / page.tsx
export const auth = nextAuthHandler.auth
