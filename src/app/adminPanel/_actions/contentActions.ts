// app/cms/_actions/contentActions.ts
"use server";

// --- Plik nie jest już potrzebny, bo wszystkie operacje obsługuje API Route ---
// Pozostaw tylko typ Offer jeśli jest używany:
export type Offer = {
  img: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  offerLink?: string;
};
