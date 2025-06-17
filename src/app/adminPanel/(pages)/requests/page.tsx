import { getRequests } from "../../_actions/reservationActions";
import RequestsClient from "../../_components/RequestsClient";

// Wymuszenie dynamicznego renderowania, aby dane były zawsze świeże
// lub poleganie na revalidatePath
export const dynamic = "force-dynamic";
// export const revalidate = 0; // Alternatywa dla force-dynamic

export default async function CmsRequestsPage() {
  // Pobierz dane po stronie serwera
  const initialRequests = await getRequests();

  return (
    <div className="container mx-auto p-4">
      {/* Możesz dodać tutaj nawigację/layout CMS */}
      <RequestsClient initialRequests={initialRequests} />
    </div>
  );
}