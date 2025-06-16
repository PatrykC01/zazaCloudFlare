// src/app/adminPanel/page.tsx

import React from "react";
import { getServerSession } from 'next-auth/next'; // <-- Importuj getServerSession
import { authOptions } from '../../api/auth/[...nextauth]/route'; // <-- Importuj swoje opcje autoryzacji
import { redirect } from 'next/navigation'; // <-- Importuj redirect dla Server Components
import LogoutButton from '../_components/LogoutButton'; // <-- Zaimportuj komponent wylogowania (zakładając, że jest w tym samym folderze)

// Twoje istniejące importy
import { getReservations } from "../_actions/reservationActions";
import ReservationsClient from "../_components/ReservationsClient";

// Zmień nazwę funkcji dla jasności, że to główna strona panelu admina
export default async function ReservationsPage({
  searchParams,
}: {
  // Typ dla searchParams pozostaje bez zmian
  searchParams: Promise<{ sortBy?: string; sortDir?: "asc" | "desc" }>;
}) {
  // --- Początek sekcji autoryzacji ---
  const session = await getServerSession(authOptions);

  // Sprawdź, czy sesja istnieje i czy użytkownik ma rolę 'admin'
  // Używamy rozszerzonego typu sesji (jeśli skonfigurowałeś types/next-auth.d.ts)
  // lub (session.user as any)?.role === 'admin' jeśli nie masz typów
  if (!session || session.user?.role !== 'admin') {
    // Middleware powinno już przekierować, ale to dodatkowe zabezpieczenie
    // W Server Component używamy redirect()
    console.warn("Nieautoryzowany dostęp do /adminPanel (Server Component) - przekierowanie");
    // Przekieruj na stronę logowania z callbackUrl, aby wrócić tutaj po zalogowaniu
    redirect('/auth/signin?callbackUrl=/adminPanel');
  }
  // --- Koniec sekcji autoryzacji ---

  // Jeśli doszliśmy tutaj, użytkownik jest zalogowanym adminem.
  // Kontynuujemy z logiką pobierania danych.

  // 1. Czekamy na załadowanie searchParams:
  const resolvedSearchParams = await searchParams; // Rozwiąż Promise
  const sortBy = resolvedSearchParams.sortBy || "startDate"; // Użyj wartości domyślnych
  const sortDir = resolvedSearchParams.sortDir || "asc";

  // 2. Pobieramy rezerwacje (tylko jeśli użytkownik jest adminem)
  const initialReservations = await getReservations(sortBy, sortDir);

  // 3. Renderujemy stronę panelu admina
  return (
    <div className="container mx-auto p-4"> {/* Przykładowy kontener/padding */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel Administratora - Rezerwacje</h1>
        {/* Przycisk wylogowania */}
        <LogoutButton />
      </div>

      {/* Reszta Twojego interfejsu - komponent kliencki do wyświetlania rezerwacji */}
      <ReservationsClient
         initialReservations={initialReservations}
      />

      {/* Możesz tu dodać linki do innych sekcji panelu admina w przyszłości */}
      {/* np. <Link href="/adminPanel/content">Zarządzaj treścią</Link> */}
    </div>
  );
}