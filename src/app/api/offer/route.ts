import { NextResponse } from "next/server";
import { supabaseFetch } from "@/lib/supabaseFetch";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";
export const runtime = "edge";

async function verifyJwt(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// GET: Pobierz wszystkie oferty
export async function GET() {
  try {
    const offers = await supabaseFetch<any[]>("offers", {
      method: "GET",
      admin: false,
    });
    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Błąd pobierania ofert" },
      { status: 500 }
    );
  }
}

// POST: Dodaj nową ofertę (tylko admin)
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Brak sesji" },
        { status: 401 }
      );
    const session = await verifyJwt(token);
    if (!session || session.role !== "admin")
      return NextResponse.json(
        { success: false, message: "Brak uprawnień" },
        { status: 403 }
      );

    const data = await request.json();
    // Oczekiwane pola: img, title, description, features (array lub csv), price, offerLink
    const offer = {
      img: data.img || "",
      title: data.title || "",
      description: data.description || "",
      features: Array.isArray(data.features)
        ? data.features
        : String(data.features || "")
            .split(",")
            .map((f: string) => f.trim()),
      price: data.price || "",
      offerLink: data.offerLink || undefined,
    };
    await supabaseFetch("offers", {
      method: "POST",
      admin: true,
      body: JSON.stringify([offer]),
      headers: { Prefer: "return=representation" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd dodawania oferty" },
      { status: 500 }
    );
  }
}

// DELETE: Usuń ofertę po tytule (tylko admin)
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Brak sesji" },
        { status: 401 }
      );
    const session = await verifyJwt(token);
    if (!session || session.role !== "admin")
      return NextResponse.json(
        { success: false, message: "Brak uprawnień" },
        { status: 403 }
      );

    const { title } = await request.json();
    if (!title)
      return NextResponse.json(
        { success: false, message: "Brak tytułu" },
        { status: 400 }
      );
    await supabaseFetch("offers", {
      method: "DELETE",
      admin: true,
      query: `title=eq.${encodeURIComponent(title)}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd usuwania oferty" },
      { status: 500 }
    );
  }
}
