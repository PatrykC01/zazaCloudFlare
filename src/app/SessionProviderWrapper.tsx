// src/app/SessionProviderWrapper.tsx
'use client'; // Ten komponent musi być komponentem klienckim

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface Props {
  children: React.ReactNode;
  // Nie przekazujemy tu sesji z góry, bo w App Router layout jest Server Component
}

export default function SessionProviderWrapper({ children }: Props) {
  // SessionProvider pobierze sesję po stronie klienta
  return <SessionProvider>{children}</SessionProvider>;
}