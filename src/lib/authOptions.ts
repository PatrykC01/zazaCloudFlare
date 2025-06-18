import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "./crypto";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Nazwa użytkownika", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(
        credentials: Record<"username" | "password", string> | undefined
      ) {
        console.log("🚀 [authorize] called with:", credentials);
        if (!credentials) {
          console.log("❌ No credentials provided");
          return null;
        }
        const { username, password } = credentials;
        console.log("✅ Got username:", username, "password:", password);

        // Sprawdź ENV-y
        console.log("🛠️ ENV ADMIN_USERNAME:", process.env.ADMIN_USERNAME);
        console.log(
          "🛠️ ENV ADMIN_PASSWORD_HASH:",
          process.env.ADMIN_PASSWORD_HASH
        );

        // Tutaj dalej Twój verifyPassword...
        const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH || "").split(":");
        const ok = await verifyPassword(password, salt, hash);
        console.log("🔑 verifyPassword returned:", ok);

        if (username === process.env.ADMIN_USERNAME && ok) {
          console.log("🎉 Authorization success");
          return { id: "admin", name: username, role: "admin" };
        }
        console.log("❌ Authorization failed");
        return null;
      },
    }),
  ],
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  debug: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
