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

// GET: Pobierz wszystkie zapytania (tylko admin)
export async function GET() {
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

    const requests = await supabaseFetch<any[]>("request", {
      method: "GET",
      admin: true,
      query: "order=id.desc",
    });
    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Błąd pobierania zapytań" },
      { status: 500 }
    );
  }
}

// DELETE: Usuń zapytanie (tylko admin)
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

    const { id } = await request.json();
    if (!id)
      return NextResponse.json(
        { success: false, message: "Brak id" },
        { status: 400 }
      );
    await supabaseFetch("request", {
      method: "DELETE",
      admin: true,
      query: `id=eq.${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd usuwania zapytania" },
      { status: 500 }
    );
  }
}

// PATCH: Akceptuj lub aktualizuj zapytanie (tylko admin)
export async function PATCH(request: Request) {
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

    const { id, action, ...data } = await request.json();
    if (!id)
      return NextResponse.json(
        { success: false, message: "Brak id" },
        { status: 400 }
      );

    if (action === "accept") {
      // 1. Pobierz dane requesta
      const reqRes = await supabaseFetch<any[]>("request", {
        method: "GET",
        admin: true,
        query: `id=eq.${id}`,
      });
      const reqData = Array.isArray(reqRes) ? reqRes[0] : null;
      if (!reqData) {
        return NextResponse.json(
          { success: false, message: "Nie znaleziono zapytania" },
          { status: 404 }
        );
      }
      // 2. Utwórz rezerwację na podstawie requesta
      const reservationPayload = {
        firstName: reqData.firstName,
        lastName: reqData.lastName,
        phoneNumber: reqData.phoneNumber,
        powerboat: reqData.powerboat,
        startDate: reqData.startDate,
        endDate: reqData.endDate,
        annotation: reqData.annotation,
      };
      const resCreate = await supabaseFetch("reservation", {
        method: "POST",
        admin: true,
        body: reservationPayload,
      });
      // 3. Usuń request
      await supabaseFetch("request", {
        method: "DELETE",
        admin: true,
        query: `id=eq.${id}`,
      });
      return NextResponse.json({ success: true });
    } else {
      // Standardowa aktualizacja requesta
      await supabaseFetch("request", {
        method: "PATCH",
        admin: true,
        query: `id=eq.${id}`,
        body: JSON.stringify(data),
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd aktualizacji zapytania" },
      { status: 500 }
    );
  }
}
