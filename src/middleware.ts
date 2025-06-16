// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // Funkcja middleware uruchamiana, gdy `authorized` zwróci `true`
  function middleware(req) {
    // console.log('Token w middleware:', req.nextauth.token); // Debugowanie

    // Sprawdzamy, czy użytkownik próbuje dostać się do /adminPanel
    // i czy ma rolę 'admin' w tokenie
    if (
      req.nextUrl.pathname.startsWith('/adminPanel') &&
      req.nextauth.token?.role !== 'admin'
    ) {
      // Jeśli użytkownik jest zalogowany, ale nie jest adminem,
      // przekieruj go np. na stronę główną lub stronę 'brak dostępu'
      console.log('Nieautoryzowany dostęp do /adminPanel przez:', req.nextauth.token?.name || 'nieznany');
      return NextResponse.redirect(new URL('/', req.url)); // Przekierowanie na stronę główną
      // lub: return NextResponse.redirect(new URL('/brak-dostepu', req.url));
    }

    // Jeśli warunek nie jest spełniony (użytkownik jest adminem lub idzie na inną chronioną stronę)
    // pozwól na kontynuację żądania
    return NextResponse.next();
  },
  {
    callbacks: {
      // Ten callback decyduje, CZY middleware `withAuth` ma w ogóle działać
      // i czy użytkownik jest "autoryzowany" (tutaj: po prostu zalogowany)
      authorized: ({ token }) => {
        // !!token sprawdza, czy token istnieje (czy użytkownik jest zalogowany)
        // Szczegółowe sprawdzenie roli robimy w głównej funkcji middleware powyżej.
        return !!token;
      },
    },
    // Jeśli `authorized` zwróci `false` (użytkownik niezalogowany),
    // nastąpi przekierowanie na stronę logowania
    pages: {
      signIn: '/auth/signin', // Upewnij się, że ta strona istnieje
      error: '/auth/error',   // Strona błędów (np. po nieudanym logowaniu przez OAuth)
    },
  }
);

// Konfiguracja matcher'a - określa, które ścieżki są chronione przez TO middleware
export const config = {
  matcher: [
    '/adminPanel/:path*', // Chroni /adminPanel i wszystkie jego podstrony
    // Możesz tu dodać inne ścieżki do ochrony, np. '/profil/:path*'
    // WAŻNE: NIE dodawaj tutaj ścieżek API ani ścieżek publicznych (_next, favicon.ico itp.)
    // NextAuth domyślnie je ignoruje, ale matcher jest specyficzny dla Twojego middleware.
  ],
};