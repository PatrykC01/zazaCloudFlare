// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        /* ... */
      },
      async authorize(credentials, req) {
        console.log("--- Authorize Function Start ---");
        console.log("Credentials received:", {
          username: credentials?.username,
          passwordExists: !!credentials?.password,
        });

        // === UPEWNIJ SIĘ, ŻE TE DWIE LINIE ISTNIEJĄ TUTAJ ===
        const adminUsernameFromEnv = process.env.ADMIN_USERNAME;
        const adminPasswordHashFromEnv = process.env.ADMIN_PASSWORD_HASH;
        // ====================================================

        // Teraz logowanie zmiennych powinno działać poprawnie
        console.log("ENV Variables Check:", {
          adminUsernameFromEnv,
          adminPasswordHashExists: !!adminPasswordHashFromEnv,
        });

        if (!credentials?.username || !credentials?.password) {
          console.error("Authorize Error: Missing credentials");
          return null;
        }

        // Sprawdzenie, czy zmienne środowiskowe istnieją (teraz używamy zdefiniowanych zmiennych)
        if (!adminUsernameFromEnv || !adminPasswordHashFromEnv) {
          console.error("Authorize Error: Missing ENV variables for admin!");
          return null;
        }

        // Sprawdź nazwę użytkownika (teraz używamy zdefiniowanej zmiennej)
        const isUsernameMatch = credentials.username === adminUsernameFromEnv;
        console.log(
          `Username Match (${credentials.username} === ${adminUsernameFromEnv}):`,
          isUsernameMatch
        );

        if (isUsernameMatch) {
          console.log("Attempting password comparison...");

          // !!! ========================================================= !!!
          // !!! BARDZO NIEBEZPIECZNE - TYLKO DO DEBUGOWANIA LOKALNEGO !!!
          // !!!          PAMIĘTAJ NATYCHMIAST USUNĄĆ!                !!!
          console.log(
            `!!! DEBUG: Hasło otrzymane z formularza: "${credentials.password}"`
          );
          console.log(
            `!!! DEBUG: Hash z .env.local używany do porównania: "${adminPasswordHashFromEnv}"`
          );
          // !!! ========================================================= !!!

          try {
            // Porównanie hasła (teraz używamy zdefiniowanej zmiennej)
            const passwordMatches = await bcrypt.compare(
              credentials.password,
              adminPasswordHashFromEnv
            );
            console.log("Password comparison result:", passwordMatches);

            if (passwordMatches) {
              console.log(
                "Authorization SUCCESSFUL for user:",
                credentials.username
              );
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

  // Sekcja callbacks powinna być OK, jeśli ją wkleiłeś poprawnie
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
        console.log(`>>> JWT Callback: Added role '${user.role}' to token`);
      } else if (user) {
        console.log(
          `>>> JWT Callback: User object present but NO role field found!`,
          user
        );
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

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
