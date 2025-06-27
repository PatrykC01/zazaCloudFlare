export const runtime = "edge";

import RequestsClient from "../../_components/RequestsClient";

// Wymuszenie dynamicznego renderowania, aby dane były zawsze świeże
// lub poleganie na revalidatePath
export const dynamic = "force-dynamic";
// export const revalidate = 0; // Alternatywa dla force-dynamic

export default function CmsRequestsPage() {
  return (
    <div className="container mx-auto p-4">
      {/* Możesz dodać tutaj nawigację/layout CMS */}
      <RequestsClient />
    </div>
  );
}
