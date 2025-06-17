// src/middleware.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Używamy naszego pliku konfiguracyjnego

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth; // req.auth to teraz bezpośrednio obiekt sesji

  // Sprawdzamy, czy użytkownik jest zalogowany i czy ma odpowiednią rolę
  if (pathname.startsWith('/adminPanel')) {
    // req.auth będzie null jeśli użytkownik nie jest zalogowany.
    // auth() samo obsłuży przekierowanie w takim przypadku.
    // My musimy sprawdzić tylko przypadek zalogowanego użytkownika bez uprawnień.
    if (session && (session.user as any)?.role !== 'admin') {
      console.log('Nieautoryzowany dostęp do /adminPanel przez:', session.user?.name || 'nieznany');
      // Przekierowujemy na stronę główną, bo użytkownik jest zalogowany, ale nie jest adminem.
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Dla wszystkich innych przypadków (admin na /adminPanel lub dowolny użytkownik na innej stronie),
  // pozwalamy na kontynuację.
  return NextResponse.next();
});

// Konfiguracja matcher'a - pozostaje bez zmian.
export const config = {
  matcher: ['/adminPanel/:path*'],
};