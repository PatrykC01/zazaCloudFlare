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

  // Use absolute URL for fetch in server component
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const url = `${baseUrl}/api/reservation?sortBy=${sortBy}&sortDir=${sortDir}`;
  const res = await fetch(url, { cache: "no-store" });
  const initialReservations = res.ok ? await res.json() : [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Panel Administratora – Rezerwacje
        </h1>
   
      </div>
      <ReservationsClient initialReservations={initialReservations} />
    </div>
  );
}
