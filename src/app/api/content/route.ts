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
import { jwtVerify } from "jose";

async function verifyJwt(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Sprawdź JWT sesji admina
    const cookieStore = cookies();
    const token = cookieStore.get("admin_session")?.value;
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
    const upsertPayload = [{ tagName, tagContent }];
    let upsertResult;
    try {
      upsertResult = await supabaseFetch("content", {
        method: "POST",
        admin: true,
        body: upsertPayload, // przekazujemy obiekt, nie string
        headers: {
          Prefer: "return=representation, resolution=merge-duplicates",
        },
        query: "on_conflict=tagName", // KLUCZOWE: upsert po tagName
      });
    } catch (err) {
      console.error("Supabase upsert error:", err);
      return NextResponse.json(
        { success: false, message: "Błąd Supabase: " + String(err) },
        { status: 500 }
      );
    }

    if (
      !upsertResult ||
      !Array.isArray(upsertResult) ||
      upsertResult.length === 0
    ) {
      console.error("Supabase upsert zwrócił pustą odpowiedź:", upsertResult);
      return NextResponse.json(
        { success: false, message: "Upsert nie powiódł się" },
        { status: 500 }
      );
    }

    // 4. Zwróć sukces i dane
    return NextResponse.json({ success: true, data: upsertResult });
  } catch (error) {
    console.error("API /api/content POST error:", error);
    return NextResponse.json(
      { success: false, message: "Błąd zapisu" },
      { status: 500 }
    );
  }
}
