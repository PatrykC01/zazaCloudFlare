// src/app/adminPanel/(pages)/page.tsx
export const runtime = "edge";

import LogoutButton from "../_components/LogoutButton";
import ReservationsClient from "../_components/ReservationsClient";

export default async function AdminPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ sortBy?: string; sortDir?: "asc" | "desc" }>;
}) {
  const { sortBy = "startDate", sortDir = "asc" } = await searchParams;
  const initialReservations = await getReservations(sortBy, sortDir);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Panel Administratora – Rezerwacje
        </h1>
        <LogoutButton />
      </div>
      <ReservationsClient initialReservations={initialReservations} />
    </div>
  );
}
