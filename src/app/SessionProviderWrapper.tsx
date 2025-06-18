// src/app/SessionProviderWrapper.tsx
"use client"; // Ten komponent musi być komponentem klienckim

// This file is obsolete after migration to custom JWT-based authentication and can be safely deleted.
// All NextAuth logic has been removed. You can delete this file.

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
