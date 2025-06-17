// src/app/api/reservation/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- TUTAJ LOGIKA WALIDACJI PO STRONIE SERWERA ---
    // (Bardzo ważne! Nigdy nie ufaj tylko walidacji front-endowej)
    const { firstname, lastname, phone, startDate, endDate, powerboat, lterms } = body;
    if (!firstname || !lastname || !phone || !startDate || !endDate || !powerboat || !lterms) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    // Dodaj bardziej szczegółową walidację (np. format telefonu, daty)

    // --- TUTAJ LOGIKA ZAPISU DO BAZY DANYCH / WYSYŁKI EMAILA ---
    console.log('Received reservation request:', body);
    // np. await saveToDatabase(body);
    // np. await sendConfirmationEmail(body);

    // --- Odpowiedź Sukcesu ---
    return NextResponse.json({ message: 'Zapytanie o rezerwację zostało wysłane pomyślnie!' }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Reservation API error:", error);
    let errorMessage = 'Wystąpił błąd serwera podczas przetwarzania zapytania.';
    if (error instanceof SyntaxError) {
        errorMessage = 'Błędny format danych JSON.';
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}