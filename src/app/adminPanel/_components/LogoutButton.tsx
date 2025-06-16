// src/app/adminPanel/LogoutButton.tsx
'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Przekieruj na stronę główną po wylogowaniu
  };

  return (
    <button onClick={handleLogout} style={{ marginTop: '20px' }}>
      Wyloguj się
    </button>
  );
}