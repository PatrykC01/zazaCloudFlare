// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from 'bcryptjs';

//export const runtime = 'edge'; // Nadal potrzebne dla Cloudflare!

const handler = NextAuth({
  providers: [
    Credentials({
      // Nie musisz definiować 'credentials' tutaj, jeśli masz niestandardową stronę logowania
      // ale zostawiamy dla spójności
      credentials: {
        username: { label: "Username" },
        password: { label: "Password" }
      },
      async authorize(credentials) {
        console.log("--- Authorize Function Start (Auth.js v5) ---");
        console.log("Credentials received:", {
          username: credentials?.username,
          passwordExists: !!credentials?.password,
        });

        // W Auth.js v5 dostęp do zmiennych środowiskowych jest taki sam
        const adminUsernameFromEnv = process.env.ADMIN_USERNAME;
        const adminPasswordHashFromEnv = process.env.ADMIN_PASSWORD_HASH;

        console.log("ENV Variables Check:", {
          adminUsernameFromEnv,
          adminPasswordHashExists: !!adminPasswordHashFromEnv,
        });

        if (!credentials?.username || !credentials?.password) {
          console.error("Authorize Error: Missing credentials");
          return null;
        }

        if (!adminUsernameFromEnv || !adminPasswordHashFromEnv) {
          console.error("Authorize Error: Missing ENV variables for admin!");
          return null;
        }

        const isUsernameMatch = credentials.username === adminUsernameFromEnv;
        console.log(
          `Username Match (${credentials.username} === ${adminUsernameFromEnv}):`,
          isUsernameMatch
        );

        if (isUsernameMatch) {
          console.log("Attempting password comparison...");
          try {
            const passwordMatches = await bcrypt.compare(
              credentials.password as string,
              adminPasswordHashFromEnv
            );
            console.log("Password comparison result:", passwordMatches);

            if (passwordMatches) {
              console.log(
                "Authorization SUCCESSFUL for user:",
                credentials.username
              );
              // Zwracany obiekt użytkownika
              return {
                id: "admin-user-id",
                name: "Administrator",
                email: "admin@twojadomena.pl",
                role: "admin",
              };
            } else {
              console.log("Password comparison FAILED.");
            }
          } catch (compareError) {
            console.error("Error during bcrypt.compare:", compareError);
            return null;
          }
        } else {
          console.log("Username did not match.");
        }

        console.log("Authorization FAILED for user:", credentials.username);
        return null;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin", error: "/auth/error" },

  callbacks: {
    // Twoje callbacki działają tak samo!
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
        console.log(`>>> JWT Callback: Added role '${user.role}' to token`);
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role && session.user) {
        (session.user as any).role = token.role;
        console.log(
          `>>> Session Callback: Added role '${token.role}' to session user`
        );
      }
      return session;
    },
  },
});

export const GET = handler;
export const POST = handler;