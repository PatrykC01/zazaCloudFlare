import { NextResponse } from "next/server";
import { supabaseFetch } from "@/lib/supabaseFetch";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/crypto";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// GET: Pobierz wszystkie media (obrazy i wideo)
export async function GET() {
  try {
    const images = await supabaseFetch<any[]>("gallery_images", {
      method: "GET",
      admin: false,
    });
    const videos = await supabaseFetch<any[]>("gallery_videos", {
      method: "GET",
      admin: false,
    });
    return NextResponse.json({ images, videos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Błąd pobierania mediów" },
      { status: 500 }
    );
  }
}

// POST: Dodaj nowe medium (tylko admin)
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("zaza_admin_session")?.value;
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
    // Oczekiwane pola: mediaType (IMG/VID), mediaPath
    if (!data.mediaType || !data.mediaPath)
      return NextResponse.json(
        { success: false, message: "Brak danych" },
        { status: 400 }
      );
    const table =
      data.mediaType === "IMG" ? "gallery_images" : "gallery_videos";
    await supabaseFetch(table, {
      method: "POST",
      admin: true,
      body: JSON.stringify([{ path: data.mediaPath }]),
      headers: { Prefer: "return=representation" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd dodawania medium" },
      { status: 500 }
    );
  }
}

// DELETE: Usuń medium (tylko admin)
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("zaza_admin_session")?.value;
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

    const { mediaType, mediaPath } = await request.json();
    if (!mediaType || !mediaPath)
      return NextResponse.json(
        { success: false, message: "Brak danych" },
        { status: 400 }
      );
    const table = mediaType === "IMG" ? "gallery_images" : "gallery_videos";
    await supabaseFetch(table, {
      method: "DELETE",
      admin: true,
      query: `path=eq.${encodeURIComponent(mediaPath)}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Błąd usuwania medium" },
      { status: 500 }
    );
  }
}
