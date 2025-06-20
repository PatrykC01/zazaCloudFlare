// app/cms/layout.tsx
import Link from 'next/link';
import React from 'react';
import LogoutButton from './_components/LogoutButton';

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tutaj możesz dodać logikę autentykacji/autoryzacji,
  // aby upewnić się, że tylko zalogowany admin ma dostęp

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - odpowiednik NavMenu */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav className="flex flex-col space-y-2">
          <Link href="/adminPanel" className="hover:bg-gray-700 p-2 rounded">
            <span className="oi oi-calendar mr-2" /> {/* Potrzebujesz ikon Open Iconic */}
            Rezerwacje
          </Link>
          <Link href="/adminPanel/requests" className="hover:bg-gray-700 p-2 rounded">
             <span className="oi oi-envelope-open mr-2" />
             Zgłoszenia
          </Link>
          <Link href="/adminPanel/content" className="hover:bg-gray-700 p-2 rounded">
             <span className="oi oi-wrench mr-2" />
             CMS
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Główna treść */}
      <main className="flex-1 p-6 bg-gray-100">
        {/* Możesz dodać górny pasek, jeśli potrzebujesz */}
        {/* <div className="bg-white shadow p-4 mb-4">Top Bar</div> */}
        <article className="content">
          {children}
        </article>
      </main>
    </div>
  );
}