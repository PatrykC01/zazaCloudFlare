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

    // Mapowanie nazw pól z formularza klienta na model Reservation
    const reservationData = {
      firstName: body.firstname,
      lastName: body.lastname,
      phoneNumber: body.phone,
      powerboat: body.powerboat,
      startDate: new Date(body.startDate).toISOString(),
      endDate: new Date(body.endDate).toISOString(),
      annotation: body.annotation || "Brak",
    };

    // Zapisz do Supabase (tabela: reservation)
    const [newReservation] = await supabaseFetch<any[]>("reservation", {
      method: "POST",
      body: reservationData,
      admin: true, // tylko admin panel może dodać rezerwację bezpośrednio
      headers: { Prefer: "return=representation" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rezerwacja została dodana pomyślnie!",
        reservation: newReservation,
      },
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
export async function GET(request: Request) {
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

    // Obsługa sortowania po dowolnym polu
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "startDate";
    const sortDir = searchParams.get("sortDir") || "asc";
    // Zabezpieczenie przed nieprawidłowymi wartościami
    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "powerboat",
      "startDate",
      "endDate",
      "annotation",
    ];
    const allowedDirs = ["asc", "desc"];
    const sortField = allowedFields.includes(sortBy) ? sortBy : "startDate";
    const sortDirection = allowedDirs.includes(sortDir) ? sortDir : "asc";
    const orderQuery = `order=${sortField}.${sortDirection}`;

    // Buduj query string z filtrami
    const filterParams: string[] = [orderQuery];
    allowedFields.forEach((field) => {
      const value = searchParams.get(field);
      if (value) {
        if (field === "startDate") {
          filterParams.push(`${field}=gte.${value}`);
        } else if (field === "endDate") {
          filterParams.push(`${field}=lte.${value}`);
        } else {
          // Only encode the value, not the wildcards
          const encodedValue = encodeURIComponent(value);
          filterParams.push(`${field}=ilike.*${encodedValue}*`);
        }
      }
    });
    const fullQuery = filterParams.join("&");
    // Debug: log the query string to help diagnose filter issues
    console.log("Supabase reservation query:", fullQuery);
    const reservations = await supabaseFetch<any[]>("reservation", {
      method: "GET",
      admin: true,
      query: fullQuery,
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
      body: {
        ...data,
        startDate: startDateISO,
        endDate: endDateISO,
      },
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
