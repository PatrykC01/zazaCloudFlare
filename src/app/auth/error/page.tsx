// src/app/auth/error/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from 'next/link';

// Komponent z logiką wyświetlania błędu
function ErrorDisplay() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'default';

    const errorDetails: { [key: string]: { title: string, message: string } } = {
        CredentialsSignin: {
            title: "Błąd Logowania",
            message: "Wprowadzona nazwa użytkownika lub hasło są nieprawidłowe."
        },
        default: {
            title: "Wystąpił Nieoczekiwany Błąd",
            message: "Skontaktuj się z administratorem lub spróbuj ponownie za chwilę."
        }
    };

    const details = errorDetails[error] || errorDetails.default;

    return (
        <div className="container text-center" style={{ padding: "80px 0" }}>
            <div className="row">
                <div className="col-lg-12">
                    <h2 className="h2-heading">{details.title}</h2>
                    <p className="p-heading">{details.message}</p>
                    <p className="text-muted small">Kod błędu: {error}</p>
                    <Link href="/auth/signin" legacyBehavior>
                        <a className="btn-solid-lg" style={{ marginTop: '20px' }}>Spróbuj Zalogować Się Ponownie</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}


// Główny komponent strony, opakowany w Suspense
export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div style={{ padding: "80px 0", textAlign: "center" }}>Loading...</div>}>
            <ErrorDisplay />
        </Suspense>
    );
}