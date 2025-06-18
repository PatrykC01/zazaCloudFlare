"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = "/adminPanel";
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Nieprawidłowa nazwa użytkownika lub hasło." : null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget as any;
    const username = form.username.value;
    const password = form.password.value;

    // Niech NextAuth zwróci URL, ale nie przekieruje sam
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Nieprawidłowa nazwa użytkownika lub hasło.");
      return;
    }

    // Jeżeli NextAuth poda res.url, to tam jest albo "/adminPanel", albo pełny URL.
    // Użyj window.location, żeby nastąpiło pełne przeładowanie i cookie zadziałało.
    if (res?.url) {
      window.location.href = res.url;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Nazwa użytkownika</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="form-control-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="form-control-input"
        />
      </div>

      <button type="submit" className="form-control-submit-button">
        Zaloguj się
      </button>

      {error && <div className="alert alert-danger">{error}</div>}
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="container form-1">
      <h2>Panel Administratora</h2>
      <Suspense fallback={<div>Ładowanie formularza logowania...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
