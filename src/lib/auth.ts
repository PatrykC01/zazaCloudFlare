// src/lib/authOptions.ts
import Credentials from 'next-auth/providers/credentials'
import { hashPassword, verifyPassword } from './crypto'
import { getAdminUser } from './db' // Twoja funkcja pobierająca admina z bazy

export const authOptions = {
  providers: [
    Credentials({
      name: 'Admin',
      credentials: {
        username: { label: 'Nazwa', type: 'text' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        const admin = await getAdminUser()
        if (!credentials || !admin) return null

        const [salt, hash] = admin.password.split(':')
        if (verifyPassword(credentials.password, salt, hash)) {
          return { id: admin.id, name: admin.username, role: 'admin' }
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
        (session.user as any).role = token.role
      }
      return session
    },
  },
}
