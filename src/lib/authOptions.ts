// src/lib/authOptions.ts
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "./crypto";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Nazwa użytkownika", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USERNAME;
        const adminHash = process.env.ADMIN_PASSWORD_HASH; // "salt:hash" lub hash bcrypt
        if (
          !credentials?.username ||
          !credentials?.password ||
          !adminUser ||
          !adminHash
        ) {
          return null;
        }
        // Jeśli hash zawiera dwukropek, użyj PBKDF2, w przeciwnym razie bcrypt
        if (adminHash.includes(":")) {
          const [salt, hash] = adminHash.split(":");
          const ok = await verifyPassword(credentials.password, salt, hash);
          if (credentials.username === adminUser && ok) {
            return { id: "admin", name: adminUser, role: "admin" };
          }
        } else {
          const ok = await bcrypt.compare(credentials.password, adminHash);
          if (credentials.username === adminUser && ok) {
            return { id: "admin", name: adminUser, role: "admin" };
          }
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
