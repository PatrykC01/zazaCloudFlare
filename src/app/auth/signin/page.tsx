// src/app/auth/signin/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from 'next/link';

// Ten komponent zawiera całą logikę formularza logowania
function SignInForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/adminPanel";

  const errorMessages: { [key: string]: string } = {
    CredentialsSignin: "Nieprawidłowa nazwa użytkownika lub hasło. Spróbuj ponownie.",
    default: "Wystąpił błąd podczas logowania.",
  };

  const errorMessage = error && (errorMessages[error] || errorMessages.default);

  return (
    <div id="contact" className="form-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <h2 className="h2-heading">Panel Administratora</h2>
            <p className="p-heading">Zaloguj się, aby zarządzać treścią strony</p>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            {errorMessage && (
              <div className="alert alert-danger text-center" role="alert">
                {errorMessage}
              </div>
            )}

            <form
              method="post"
              action={`/api/auth/callback/credentials`}
            >
              <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />

              <div className="form-group">
                <input
                  type="text"
                  className="form-control-input"
                  id="username"
                  name="username"
                  required
                />
                <label className="label-control" htmlFor="username">
                  Nazwa użytkownika
                </label>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  className="form-control-input"
                  id="password"
                  name="password"
                  required
                />
                <label className="label-control" htmlFor="password">
                  Hasło
                </label>
              </div>
              <div className="form-group">
                <button type="submit" className="form-control-submit-button">
                  Zaloguj się
                </button>
              </div>
            </form>
             <div className="back-to-home text-center mt-4">
                <Link href="/" legacyBehavior>
                    <a className="text-decoration-none">Powrót na stronę główną</a>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Główny komponent strony, który eksportujemy
// Używa <Suspense> do opakowania formularza
export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}