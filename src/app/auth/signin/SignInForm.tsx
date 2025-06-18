// src/app/auth/signin/SignInForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const username = (form.username as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      // Redirect to admin panel
      router.push("/adminPanel");
    } else {
      const data = await res.json();
      setError(data.message || "Błąd logowania");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        type="text"
        placeholder="Nazwa użytkownika"
        required
      />
      <input name="password" type="password" placeholder="Hasło" required />
      <button type="submit">Zaloguj się</button>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </form>
  );
}
