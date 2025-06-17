// src/middleware.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Używamy naszego pliku konfiguracyjnego

// W Auth.js v5 cała logika middleware dzieje się w jednej funkcji.
// auth() jest "wszystkim w jednym" - zastępuje withAuth i authorized.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const { token } = req.auth; // req.auth zastępuje req.nextauth

  // Sprawdzamy, czy użytkownik jest na stronie chronionej i czy ma odpowiednią rolę.
  // Ta logika jest taka sama jak Twoja!
  if (pathname.startsWith('/adminPanel') && token?.role !== 'admin') {
    // Jeśli użytkownik jest zalogowany, ale nie jest adminem,
    // przekierowujemy go na stronę główną.
    console.log('Nieautoryzowany dostęp do /adminPanel przez:', token?.name || 'nieznany');
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Jeśli warunek nie jest spełniony (użytkownik jest adminem LUB jest na innej stronie),
  // pozwalamy na kontynuację. Funkcja `auth` domyślnie zajmie się niezalogowanymi
  // użytkownikami, przekierowując ich na stronę zdefiniowaną w `pages: { signIn: ... }`
  // w pliku auth.ts
  return NextResponse.next();
});

// Konfiguracja matcher'a - pozostaje bez zmian.
export const config = {
  matcher: ['/adminPanel/:path*'],
};