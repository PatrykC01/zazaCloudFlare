// src/app/api/reservation/route.ts
import { NextResponse } from "next/server";
import { supabaseFetch } from "@/lib/supabaseFetch";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
    const body = await request.json();

    // Podstawowa walidacja (możesz dodać bardziej szczegółową)
    const requiredFields = [
      "firstname",
      "lastname",
      "phone",
      "startDate",
      "endDate",
      "powerboat",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    // Możesz dodać walidację formatu daty, telefonu itp.

    // Mapowanie nazw pól z formularza klienta na model Request
    const requestData = {
      firstName: body.firstname, // Mapowanie
      lastName: body.lastname, // Mapowanie
      phoneNumber: body.phone, // Mapowanie
      powerboat: body.powerboat,
      startDate: new Date(body.startDate).toISOString(), // Zapisz jako ISO string
      endDate: new Date(body.endDate).toISOString(), // Zapisz jako ISO string
      annotation: body.annotation || "Brak",
      // lterms nie jest częścią modelu Request, więc go pomijamy
    };

    // Zapisz do Supabase (tabela: request)
    const [newRequest] = await supabaseFetch<any[]>("request", {
      method: "POST",
      body: requestData,
      admin: false, // public insert (RLS must allow)
      headers: { Prefer: "return=representation" }, // zwróć nowy rekord
    });

    return NextResponse.json(
      { message: "Zapytanie została wysłana pomyślnie!", request: newRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating request:", error);
    let errorMessage = "Wystąpił błąd podczas przetwarzania zapytania.";
    if (error instanceof Error) {
      // Można dodać bardziej szczegółowe logowanie błędów Prisma
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// GET: Pobierz wszystkie rezerwacje (tylko admin)
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

    const reservations = await supabaseFetch<any[]>("reservation", {
      method: "GET",
      admin: true,
      query: "order=startDate.asc",
    });
    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Błąd pobierania rezerwacji" },
      {
        status: 500,
      }
    );
  }
}

// PATCH: Aktualizuj rezerwację (tylko admin)
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

    const { id, ...data } = await request.json();
    if (!id)
      return NextResponse.json(
        { success: false, message: "Brak id" },
        {
          status: 400,
        }
      );
    const startDateISO =
      typeof data.startDate === "string"
        ? data.startDate
        : new Date(data.startDate).toISOString();
    const endDateISO =
      typeof data.endDate === "string"
        ? data.endDate
        : new Date(data.endDate).toISOString();
    await supabaseFetch("reservation", {
      method: "PATCH",
      admin: true,
      query: `id=eq.${id}`,
      body: JSON.stringify({
        ...data,
        startDate: startDateISO,
        endDate: endDateISO,
      }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd aktualizacji rezerwacji" },
      { status: 500 }
    );
  }
}

// DELETE: Usuń rezerwację (tylko admin)
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
        {
          status: 400,
        }
      );
    await supabaseFetch("reservation", {
      method: "DELETE",
      admin: true,
      query: `id=eq.${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd usuwania rezerwacji" },
      { status: 500 }
    );
  }
}
