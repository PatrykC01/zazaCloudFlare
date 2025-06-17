// src/app/adminPanel/(pages)/page.tsx

import React from "react";
import { auth } from "@/lib/auth"; // <-- POPRAWNY IMPORT
import { redirect } from 'next/navigation';
import LogoutButton from '../_components/LogoutButton';
import { getReservations } from "../_actions/reservationActions";
import ReservationsClient from "../_components/ReservationsClient";

export const runtime = 'edge';

export default async function AdminPanelPage({ // Zmieniona nazwa na bardziej ogólną
  searchParams,
}: {
  searchParams: Promise<{ sortBy?: string; sortDir?: "asc" | "desc" }>;
}) {
  const session = await auth();

  // Middleware już powinno załatwić sprawę, ale to jest dodatkowe zabezpieczenie
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/adminPanel');
  }

  const resolvedSearchParams = await searchParams;
  const sortBy = resolvedSearchParams.sortBy || "startDate";
  const sortDir = resolvedSearchParams.sortDir || "asc";
  const initialReservations = await getReservations(sortBy, sortDir);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel Administratora - Rezerwacje</h1>
        <LogoutButton />
      </div>
      <ReservationsClient initialReservations={initialReservations} />
    </div>
  );
}