// app/cms/_actions/reservationActions.ts
"use server";

// Typ dla danych rezerwacji (powinien pasować do formularza i modelu Reservation)
export interface ReservationData {
  id?: number; // Opcjonalne dla tworzenia
  powerboat: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  annotation: string;
  startDate: string | Date; // Akceptuj oba, konwertuj w akcjach
  endDate: string | Date; // Akceptuj oba, konwertuj w akcjach
}

// Typ dla danych zapytania (pasuje do modelu Request)
// Zauważ różnice w nazwach pól w porównaniu do ReservationData (np. phoneNumber)
// Użyjemy typu generowanego przez Prisma dla spójności

// --- Usunięto server actions, eksportuj tylko typy ---
export type { ReservationData };
