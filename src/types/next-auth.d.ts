// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Rozszerzamy interfejs User zwracany przez `authorize`
   */
  interface User {
    role?: string // Dodajemy opcjonalną rolę
  }

  /**
   * Rozszerzamy interfejs Session, aby zawierał rolę
   */
  interface Session {
    user?: {
      role?: string // Dodajemy rolę do obiektu użytkownika w sesji
    } & DefaultSession["user"] // Łączymy z domyślnymi polami (name, email, image)
  }
}

declare module "next-auth/jwt" {
  /** Rozszerzamy interfejs JWT */
  interface JWT {
    role?: string
  }
}