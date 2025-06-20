export const runtime = "edge";

import RequestsClient from "../../_components/RequestsClient";

// Wymuszenie dynamicznego renderowania, aby dane były zawsze świeże
// lub poleganie na revalidatePath
export const dynamic = "force-dynamic";
// export const revalidate = 0; // Alternatywa dla force-dynamic

export default async function CmsRequestsPage() {
  // Pobierz dane po stronie serwera przez API Route
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const res = await fetch(`${baseUrl}/api/request`, { cache: "no-store" });
  const initialRequests = res.ok ? await res.json() : [];

  return (
    <div className="container mx-auto p-4">
      {/* Możesz dodać tutaj nawigację/layout CMS */}
      <RequestsClient initialRequests={initialRequests} />
    </div>
  );
}
