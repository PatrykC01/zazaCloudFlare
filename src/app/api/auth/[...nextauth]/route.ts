// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'edge'
export const { GET, POST } = NextAuth(authOptions)
