"use client";
// app/cms/_components/ReservationCard.tsx
import React from "react";
import type { ReservationData } from "@/types/reservation";
import { format } from "date-fns"; // Biblioteka do formatowania dat

type ReservationFromServer = ReservationData & { id: number };

interface ReservationCardProps {
  reservation: ReservationFromServer;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean; // Aby wyłączyć przyciski podczas operacji
}

export default function ReservationCard({
  reservation,
  onEdit,
  onDelete,
  isPending,
}: ReservationCardProps) {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Brak daty";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Nieprawidłowa data");
      }
      return format(parsedDate, "dd.MM.yyyy HH:mm");
    } catch {
      return "Nieprawidłowa data";
    }
  };

  return (
    <div className="reservation-card border shadow p-4 bg-white rounded relative min-h-[200px]">
      {" "}
      {/* Style z Blazora */}
      {/* Przyciski akcji */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={onEdit}
          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
          disabled={isPending}
          aria-label="Edytuj"
        >
          ✏️ {/* Ikona edycji */}
        </button>
        <button
          onClick={onDelete}
          className="remove-icon text-red-500 hover:text-red-700 disabled:opacity-50" // Klasa z Blazora
          disabled={isPending}
          aria-label="Usuń"
        >
          ❌
        </button>
      </div>
      {/* Dane rezerwacji */}
      <div onClick={onEdit} className="cursor-pointer">
        {" "}
        {/* Kliknięcie całej karty też edytuje */}
        <h2 className="text-xl font-semibold mb-2">
          {reservation.firstName} {reservation.lastName}
        </h2>
        <p>Numer telefonu: {reservation.phoneNumber}</p>
        <p>Motorówka: {reservation.powerboat}</p>
        <p>Data od: {formatDate(reservation.startDate)}</p>
        <p>Data do: {formatDate(reservation.endDate)}</p>
        <p className="mb-0 reservation-annotation text-sm text-gray-600 overflow-auto max-h-16">
          {" "}
          {/* Style z Blazora */}
          Uwagi: {reservation.annotation || "Brak"}
        </p>
      </div>
    </div>
  );
}
