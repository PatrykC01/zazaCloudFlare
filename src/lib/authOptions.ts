// src/lib/authOptions.ts
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "./crypto";

export const authOptions = {
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Nazwa użytkownika", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(
        credentials: Record<"username" | "password", string> | undefined,
        request: Request
      ): Promise<null | { id: string; name: string; role: string }> {
        const adminUser = process.env.ADMIN_USERNAME;
        const adminHash = process.env.ADMIN_PASSWORD_HASH; // "salt:hash" lub hash bcrypt
        if (
          !credentials?.username ||
          !credentials?.password ||
          !adminUser ||
          !adminHash
        ) {
          return null;
        } // Split the stored hash into salt and hash parts
        try {
          const [salt, hash] = adminHash.split(":");
          if (!salt || !hash) {
            console.error(
              "Invalid password hash format in environment variables"
            );
            return null;
          } // Verify the password using PBKDF2
          // We know password exists because we checked credentials earlier
          // We already checked that credentials.password exists
          const password: string = credentials.password;
          const ok = verifyPassword(password, salt, hash);

          if (credentials.username === adminUser && ok) {
            return { id: "admin", name: adminUser, role: "admin" };
          }
        } catch (error) {
          console.error("Error verifying password:", error);
          return null;
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
