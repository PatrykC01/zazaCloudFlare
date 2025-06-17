// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // To jest cała twoja konfiguracja, którą mieliśmy wcześniej
  providers: [
    Credentials({
      async authorize(credentials) {
        const adminUsernameFromEnv = process.env.ADMIN_USERNAME;
        const adminPasswordHashFromEnv = process.env.ADMIN_PASSWORD_HASH;
        if (!credentials?.username || !credentials?.password || !adminUsernameFromEnv || !adminPasswordHashFromEnv) {
          return null;
        }
        const isUsernameMatch = credentials.username === adminUsernameFromEnv;
        if (isUsernameMatch) {
          const passwordMatches = await bcrypt.compare(
            credentials.password as string,
            adminPasswordHashFromEnv
          );
          if (passwordMatches) {
            return { id: "admin-user-id", name: "Administrator", role: "admin" };
          }
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (token?.role && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});