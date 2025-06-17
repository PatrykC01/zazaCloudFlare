// src/app/api/content/route.ts
import { NextResponse } from "next/server";
import { supabaseFetch } from "@/lib/supabaseFetch";

// Definicja typu dla zwracanych danych
// Klucze to tagName, wartości to tagContent
export type ApiContentData = {
  [key: string]: string | undefined;
};

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: Request) {
  console.log("API Route /api/content called");
  try {
    // 1. Pobierz wszystkie wpisy z tabeli content przez Supabase REST
    const allContentFromDb = await supabaseFetch<any[]>("content", {
      method: "GET",
      admin: false, // public fetch
    });
    console.log(`Fetched ${allContentFromDb.length} items from Supabase`);

    // 2. Przekształć tablicę obiektów w obiekt klucz-wartość
    const formattedContentData: ApiContentData = allContentFromDb.reduce(
      (acc, currentItem) => {
        acc[currentItem.tagName] = currentItem.tagContent;
        return acc;
      },
      {} as ApiContentData
    );

    // 3. Zwróć przekształcone dane jako JSON
    return NextResponse.json(formattedContentData, { status: 200 });
  } catch (error) {
    console.error("API /api/content error:", error);
    return NextResponse.json(
      { message: "Błąd pobierania danych z Supabase" },
      { status: 500 }
    );
  }
}
