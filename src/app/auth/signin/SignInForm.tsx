// src/app/auth/signin/SignInForm.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/adminPanel";

  return (
    <form method="post" action="/api/auth/callback/credentials">
      {/* callbackUrl przekazany do NextAuth */}
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <input
        name="username"
        type="text"
        placeholder="Nazwa użytkownika"
        required
      />
      <input name="password" type="password" placeholder="Hasło" required />
      <button type="submit">Zaloguj się</button>
      {error && (
        <div className="alert alert-danger mt-2">
          Nieprawidłowa nazwa użytkownika lub hasło.
        </div>
      )}
    </form>
  );
}
