// src/app/auth/signin/page.tsx
'use client'; // Ta strona wymaga interaktywności klienta

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation'; // Importy dla App Router

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Do odczytu parametrów URL
  const callbackUrl = searchParams.get('callbackUrl') || '/adminPanel'; // Domyślnie wracamy do panelu
  const error = searchParams.get('error'); // Sprawdź, czy jest błąd z poprzedniej próby

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(error ? "Nieprawidłowe dane logowania." : null); // Pokaż błąd od razu, jeśli jest w URL

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError(null); // Resetuj błąd przed próbą

    try {
      const result = await signIn('credentials', {
        redirect: false, // Nie pozwalamy NextAuth na automatyczne przekierowanie
        username,
        password,
        callbackUrl, // Przekazujemy callbackUrl, NextAuth go użyje jeśli logowanie się uda
      });

      if (result?.error) {
        console.error('Błąd logowania:', result.error);
        // Ustawiamy komunikat błędu na podstawie odpowiedzi
        // Można by mapować kody błędów z `authorize` na komunikaty
        setFormError('Nieprawidłowa nazwa użytkownika lub hasło.');
        // Opcjonalnie: odśwież stronę z błędem w URL dla jasności
        // router.push(`/auth/signin?error=${result.error}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else if (result?.ok && result?.url) {
        // Logowanie udane, NextAuth zwrócił URL docelowy
        // Przekierowujemy ręcznie LUB pozwalamy na domyślne zachowanie, jeśli `redirect` byłby `true`
        router.push(result.url); // Użyj URL zwróconego przez NextAuth
        // lub po prostu: router.push(callbackUrl);
      } else {
         // Inny nieoczekiwany stan
         setFormError('Wystąpił nieoczekiwany błąd podczas logowania.');
      }
    } catch (err) {
        console.error("Wyjątek podczas signIn:", err);
        setFormError('Wystąpił wyjątek podczas próby logowania.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h1>Logowanie do Panelu Administratora</h1>
      <form onSubmit={handleSubmit}>
        {/* W App Router nie ma potrzeby ręcznego dodawania CSRF tokenu w ten sposób
            gdy używamy `signIn`, NextAuth zajmuje się tym. */}
        <div>
          <label htmlFor="username">Nazwa użytkownika:</label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password">Hasło:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {formError && (
          <p style={{ color: 'red' }}>{formError}</p>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      {/* Możesz dodać linki do innych metod logowania, jeśli je skonfigurujesz */}
    </div>
  );
}