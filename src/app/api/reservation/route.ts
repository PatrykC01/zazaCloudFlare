// src/app/api/reservation/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Podstawowa walidacja (możesz dodać bardziej szczegółową)
    const requiredFields = ['firstname', 'lastname', 'phone', 'startDate', 'endDate', 'powerboat'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    // Możesz dodać walidację formatu daty, telefonu itp.

    // Mapowanie nazw pól z formularza klienta na model Request
    const requestData = {
        firstName: body.firstname, // Mapowanie
        lastName: body.lastname,   // Mapowanie
        phoneNumber: body.phone,    // Mapowanie
        powerboat: body.powerboat,
        startDate: new Date(body.startDate).toISOString(), // Zapisz jako ISO string
        endDate: new Date(body.endDate).toISOString(),     // Zapisz jako ISO string
        annotation: body.annotation || 'Brak',
        // lterms nie jest częścią modelu Request, więc go pomijamy
    };


    const newRequest = await prisma.request.create({
      data: requestData,
    });

    return NextResponse.json({ message: 'Zapytanie zostało wysłane pomyślnie!', request: newRequest }, { status: 201 });

  } catch (error) {
    console.error('Error creating request:', error);
    let errorMessage = 'Wystąpił błąd podczas przetwarzania zapytania.';
     if (error instanceof Error) {
         // Można dodać bardziej szczegółowe logowanie błędów Prisma
         errorMessage = error.message;
     }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}