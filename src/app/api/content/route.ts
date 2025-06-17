// src/app/api/content/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Zaimportuj zainicjalizowanego klienta Prisma z lib

export const runtime = 'edge';
// Opcjonalnie: Definicja typu dla zwracanych danych (dla lepszej kontroli)
// Klucze to tagName, wartości to tagContent
type ApiContentData = {
  [key: string]: string | undefined; // Lub any, jeśli nie jesteś pewien typów
};

// Ustawienie, aby trasa była dynamiczna i zawsze pobierała świeże dane
export const dynamic = "force-dynamic"; // lub 'auto' jeśli chcesz polegać na cache Next.js

export async function GET(request: Request) {
  console.log("API Route /api/content called"); // Log do debugowania
  try {
    // 1. Pobierz wszystkie wpisy z tabeli Content
    const allContentFromDb = await prisma.content.findMany();
    console.log(`Fetched ${allContentFromDb.length} items from DB`);

    // 2. Przekształć tablicę obiektów w obiekt klucz-wartość
    //    Gdzie kluczem jest tagName, a wartością tagContent
    const formattedContentData: ApiContentData = allContentFromDb.reduce(
      (acc, currentItem) => {
        acc[currentItem.tagName] = currentItem.tagContent;
        return acc;
      },
      {} as ApiContentData // Pusty obiekt jako wartość początkowa akumulatora
    );

    // 3. Zwróć przekształcone dane jako JSON
    return NextResponse.json(formattedContentData, { status: 200 });
  } catch (error) {
    console.error("API /api/content error:", error);
    // Zwróć błąd
    return NextResponse.json(
      { message: "Błąd pobierania danych z bazy" },
      { status: 500 }
    );
  } finally {
    // Dobrą praktyką jest rozłączanie klienta, chociaż w środowiskach serverless
    // jak Vercel, może to nie być zawsze konieczne lub optymalne.
    // W środowisku deweloperskim z HMR może powodować problemy jeśli nie używasz globalnego singletona.
    // Jeśli używasz singletona z `lib/prisma.ts`, to $disconnect nie jest tu potrzebne.
    // await prisma.$disconnect();
  }
}
