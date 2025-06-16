// app/cms/_actions/reservationActions.ts
'use server';

import { PrismaClient, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Typ dla danych rezerwacji (powinien pasować do formularza i modelu Reservation)
export interface ReservationData {
  id?: number; // Opcjonalne dla tworzenia
  powerboat: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  annotation: string;
  startDate: string | Date; // Akceptuj oba, konwertuj w akcjach
  endDate: string | Date;   // Akceptuj oba, konwertuj w akcjach
}

// Typ dla danych zapytania (pasuje do modelu Request)
// Zauważ różnice w nazwach pól w porównaniu do ReservationData (np. phoneNumber)
// Użyjemy typu generowanego przez Prisma dla spójności
import type { Request as RequestModel } from '@prisma/client'; // Importuj typ modelu Prisma

// --- Istniejące funkcje (createReservation, getReservations, updateReservation, deleteReservation) ---
// ... (upewnij się, że konwertują daty na ISO string przed zapisem do DB jeśli Reservation przechowuje stringi)

export async function createReservation(data: ReservationData): Promise<{ success: boolean; message?: string; reservation?: ReservationData & { id: number } }> {
  try {
    // Konwersja dat na ISO string przed zapisem, jeśli model przechowuje stringi
    const startDateISO = typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString();
    const endDateISO = typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString();

    const newReservation = await prisma.reservation.create({
      data: {
        ...data,
        startDate: startDateISO,
        endDate: endDateISO,
        id: undefined, // Usuń id z danych wejściowych
      },
    });
    revalidatePath('/cms'); // Odśwież dane w CMS
    return { success: true, reservation: { ...newReservation, startDate: newReservation.startDate, endDate: newReservation.endDate } };
  } catch (error) {
    console.error("Błąd tworzenia rezerwacji:", error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// --- NOWE FUNKCJE DLA REQUESTS ---

// Funkcja do pobierania wszystkich zapytań (Request)
export async function getRequests(): Promise<RequestModel[]> {
  try {
    const requests = await prisma.request.findMany({
        orderBy: { // Przykładowe sortowanie wg daty dodania (jeśli masz takie pole) lub ID
            id: 'desc',
        }
    });
    // Prisma zwraca daty jako obiekty Date, jeśli typ w schemie to DateTime.
    // Jeśli w schemie masz String, upewnij się, że format jest spójny.
    // Tutaj zakładamy, że model zwraca dane zgodne z RequestModel (w tym daty jako stringi ISO jak w schemie)
    return requests;
  } catch (error) {
    console.error("Błąd pobierania zapytań:", error);
    return []; // Zwróć pustą tablicę w razie błędu
  } finally {
    await prisma.$disconnect();
  }
}

// Funkcja do usuwania zapytania (Request) po ID
export async function deleteRequest(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.request.delete({
      where: { id },
    });
    // Revalidate ścieżki, gdzie wyświetlane są zapytania
    revalidatePath('/cms'); // Zakładając, że CMS jest pod /cms
    return { success: true };
  } catch (error) {
    console.error(`Błąd usuwania zapytania ${id}:`, error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// ... (reszta istniejących funkcji: getReservations, updateReservation, deleteReservation) ...
// Upewnij się, że getReservations, updateReservation, deleteReservation działają na modelu Reservation
// i poprawnie obsługują format dat (np. konwertują na ISO string przed zapisem/aktualizacją)

// Przykład poprawionej getReservations (zakładając sortowanie po stronie serwera)
export async function getReservations(sortBy: string = 'startDate', sortOrder: 'asc' | 'desc' = 'asc'): Promise<(ReservationData & { id: number })[]> {
    try {
        const reservations = await prisma.reservation.findMany({
            orderBy: {
                [sortBy]: sortOrder,
            },
        });
        // Konwersja dat z ISO string na string lub obiekt Date wg potrzeb komponentu
        return reservations.map(res => ({
            ...res,
            // Jeśli komponent oczekuje Date, zrób:
            // startDate: new Date(res.startDate),
            // endDate: new Date(res.endDate),
            // Jeśli komponent oczekuje stringa ISO (jak jest teraz w ReservationForm przez formatDateTimeLocal), zostaw jak jest:
            startDate: res.startDate,
            endDate: res.endDate,
        }));
    } catch (error) {
        console.error("Błąd pobierania rezerwacji:", error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

// Popraw updateReservation aby przyjmował poprawny format dat
export async function updateReservation(id: number, data: ReservationData): Promise<{ success: boolean; message?: string }> {
    try {
        const startDateISO = typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString();
        const endDateISO = typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString();

        await prisma.reservation.update({
            where: { id },
            data: {
                powerboat: data.powerboat,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                annotation: data.annotation,
                startDate: startDateISO,
                endDate: endDateISO,
            },
        });
        revalidatePath('/cms');
        return { success: true };
    } catch (error) {
        console.error(`Błąd aktualizacji rezerwacji ${id}:`, error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    } finally {
        await prisma.$disconnect();
    }
}

// Popraw deleteReservation (jest ok, ale dla spójności)
export async function deleteReservation(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.reservation.delete({
      where: { id },
    });
    revalidatePath('/cms');
    return { success: true };
  } catch (error) {
    console.error(`Błąd usuwania rezerwacji ${id}:`, error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// app/cms/_actions/reservationActions.ts
// ... (importy PrismaClient, revalidatePath, typy ReservationData, RequestModel)

// --- ISTNIEJĄCE AKCJE ---
// getReservations, createReservation, updateReservation, deleteReservation
// getRequests, deleteRequest
// ...

// --- NOWA AKCJA: Akceptacja Zapytania ---
export async function acceptRequest(
  requestId: number
): Promise<{ success: boolean; message?: string }> {
  const prisma = new PrismaClient(); // Utwórz instancję wewnątrz funkcji dla bezpieczeństwa wątków serverless
  try {
      // 1. Pobierz dane zapytania
      const request = await prisma.request.findUnique({
          where: { id: requestId },
      });

      if (!request) {
          return { success: false, message: `Zapytanie o ID ${requestId} nie zostało znalezione.` };
      }

      // 2. Przygotuj dane dla nowej rezerwacji (mapowanie pól)
      // Zakładamy, że pola w Request i Reservation mają te same nazwy i typy
      // Upewnij się, że format dat jest poprawny (ISO string)
      const reservationData: Omit<ReservationData, 'id'> = { // Używamy Omit, bo ID będzie auto-generowane
          powerboat: request.powerboat,
          firstName: request.firstName,
          lastName: request.lastName,
          phoneNumber: request.phoneNumber,
          annotation: request.annotation,
          startDate: request.startDate, // Zakładamy, że to już jest ISO string
          endDate: request.endDate,     // Zakładamy, że to już jest ISO string
      };

      // 3. Utwórz nową rezerwację w transakcji razem z usunięciem zapytania
      // Transakcja zapewnia, że obie operacje się powiodą lub żadna
     // ... wewnątrz funkcji acceptRequest
await prisma.$transaction(async (tx) => {
    // Stwórz rezerwację
    await tx.reservation.create({
        data: {
            ...reservationData, // Rozpakuj dane z zapytania
            // I jawnie przekonwertuj daty na ISO string
            startDate: new Date(reservationData.startDate).toISOString(),
            endDate: new Date(reservationData.endDate).toISOString(),
        },
    });

    // Usuń zapytanie
    await tx.request.delete({
        where: { id: requestId },
    });
});

      // 4. Revaliduj ścieżki dla obu list
      revalidatePath('/cms/reservations'); // Ścieżka do strony rezerwacji
      revalidatePath('/cms/requests');     // Ścieżka do strony zapytań

      return { success: true };

  } catch (error) {
      console.error(`Błąd podczas akceptowania zapytania ${requestId}:`, error);
      // Dodaj bardziej szczegółowy komunikat błędu, jeśli to możliwe
      let errorMessage = `Wystąpił błąd podczas akceptowania zapytania ${requestId}.`;
       if (error instanceof Prisma.PrismaClientKnownRequestError) {
           // Można dodać logikę obsługi specyficznych błędów Prisma
           errorMessage = `Błąd bazy danych podczas akceptowania zapytania: ${error.code}`;
       } else if (error instanceof Error) {
          errorMessage = error.message;
       }
      return { success: false, message: errorMessage };
  } finally {
      await prisma.$disconnect();
  }
}

// --- Reszta akcji ---
// ...