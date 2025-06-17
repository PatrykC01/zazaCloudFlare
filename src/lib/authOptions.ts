// src/lib/authOptions.ts
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from './crypto'

export const authOptions = {
  providers: [
    Credentials({
      name: 'Admin',
      credentials: {
        username: { label: 'Nazwa użytkownika', type: 'text' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USERNAME
        const adminHash = process.env.ADMIN_PASSWORD_HASH
        if (
          !credentials?.username ||
          !credentials?.password ||
          !adminUser ||
          !adminHash
        ) {
          return null
        }
        const [salt, hash] = adminHash.split(':')
        if (
          credentials.username === adminUser &&
          verifyPassword(credentials.password, salt, hash)
        ) {
          return { id: 'admin', name: adminUser, role: 'admin' }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/auth/signin', error: '/auth/error' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}
