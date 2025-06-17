import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const runtime = 'edge'

// To działa tylko w App Router i next-auth v5+
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
