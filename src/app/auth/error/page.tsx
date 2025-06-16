// src/app/auth/error/page.tsx
'use client' // Możemy potrzebować `useSearchParams`

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    let errorMessage = "Wystąpił błąd podczas uwierzytelniania.";

    // Możesz dodać bardziej szczegółowe komunikaty na podstawie `error`
    switch (error) {
        case 'CredentialsSignin':
            errorMessage = "Nieprawidłowa nazwa użytkownika lub hasło.";
            break;
        case 'AccessDenied':
             errorMessage = "Nie masz uprawnień do wykonania tej akcji.";
             break;
        // Dodaj inne przypadki błędów NextAuth według potrzeb
        default:
            if (error) {
                 errorMessage = `Błąd: ${error}`;
            }
            break;
    }

    return (
        <div>
            <h1>Błąd Uwierzytelniania</h1>
            <p>{errorMessage}</p>
            <Link href="/auth/signin">Spróbuj zalogować się ponownie</Link>
            <br />
            <Link href="/">Wróć na stronę główną</Link>
        </div>
    );
}