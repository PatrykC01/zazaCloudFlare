// src/app/adminPanel/page.tsx

import React from "react";
import { auth } from "next-auth"; // <-- NOWY, POPRAWNY IMPORT dla sesji
import { redirect } from 'next/navigation';
import LogoutButton from '../_components/LogoutButton';
import { getReservations } from "../_actions/reservationActions";
import ReservationsClient from "../_components/ReservationsClient";

export const runtime = 'edge';

// Zmień nazwę funkcji dla jasności, że to główna strona panelu admina
export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sortBy?: string; sortDir?: "asc" | "desc" }>;
}) {
  // --- Początek sekcji autoryzacji ---
  const session = await auth(); // Tak teraz pobieramy sesję w Auth.js v5

  // Sprawdzamy, czy sesja istnieje i czy użytkownik ma rolę admina
  if (!session || (session.user as any)?.role !== 'admin') {
    // Middleware powinno już przekierować, ale to dodatkowe zabezpieczenie
    console.warn("Nieautoryzowany dostęp do /adminPanel (Server Component) - przekierowanie");
    redirect('/auth/signin?callbackUrl=/adminPanel');
  }
  // --- Koniec sekcji autoryzacji ---

  // Jeśli doszliśmy tutaj, użytkownik jest zalogowanym adminem.
  // Kontynuujemy z logiką pobierania danych.

  // 1. Czekamy na załadowanie searchParams:
  const resolvedSearchParams = await searchParams;
  const sortBy = resolvedSearchParams.sortBy || "startDate";
  const sortDir = resolvedSearchParams.sortDir || "asc";

  // 2. Pobieramy rezerwacje (tylko jeśli użytkownik jest adminem)
  const initialReservations = await getReservations(sortBy, sortDir);

  // 3. Renderujemy stronę panelu admina
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel Administratora - Rezerwacje</h1>
        <LogoutButton />
      </div>

      <ReservationsClient
         initialReservations={initialReservations}
      />
    </div>
  );
}