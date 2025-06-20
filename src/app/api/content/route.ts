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

// POST: Upsert content (Edge-compatible, JWT-protected)
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    // 1. Sprawdź JWT sesji admina
    const cookieStore = cookies();
    const token = cookieStore.get("zaza_admin_session")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Brak sesji" },
        { status: 401 }
      );
    }
    const session = await verifyJwt(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Brak uprawnień" },
        { status: 403 }
      );
    }

    // 2. Odczytaj dane z body
    const { tagName, tagContent } = await request.json();
    if (!tagName || typeof tagContent !== "string") {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowe dane" },
        { status: 400 }
      );
    }

    // 3. Upsert do Supabase REST API
    const upsertResult = await supabaseFetch("content", {
      method: "POST",
      admin: true,
      body: JSON.stringify([{ tagName, tagContent }]),
      headers: { Prefer: "resolution=merge-duplicates" },
    });

    // 4. Zwróć sukces
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/content POST error:", error);
    return NextResponse.json(
      { success: false, message: "Błąd zapisu" },
      { status: 500 }
    );
  }
}
