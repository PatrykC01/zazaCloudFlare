// src/app/page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import DescriptionCards from "@/components/DescriptionCards";
import OffersSection from "@/components/OffersSection";
import ReservationSection from "@/components/ReservationSection";
// ReservationForm prawdopodobnie jest używany wewnątrz ReservationSection lub innego komponentu klienckiego
// import ReservationForm from "@/components/ReservationForm";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import Preloader from "@/components/Preloader";
import Script from "next/script";
import { supabaseFetch } from "@/lib/supabaseFetch"; // Import supabaseFetch
import type { Offer } from "@/types/offer"; // Import tylko typ Offer

export const runtime = "edge";
// Typ dla danych pobranych z bazy i przetworzonych
interface PageContentData {
  HeaderIMG?: string;
  AboutP?: string;
  AboutIMG?: string;
  Map?: string;
  FooterLocation?: string;
  FooterPhone?: string;
  FooterEmail?: string;
  GalleryImages?: string[]; // Będzie tablicą
  GalleryVideos?: string[]; // Będzie tablicą
  Offers?: Offer[]; // Będzie obiektem/tablicą
  // Dodaj inne pola, jeśli są potrzebne
  [key: string]: any;
}

// Funkcja do pobierania i formatowania danych (nadal Server Component)
async function getContentData(): Promise<PageContentData> {
   try {
    const base = process.env.NEXT_PUBLIC_BASE_URL!;
    const res = await fetch(`${base}/api/content`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const formattedData = await res.json();

    // Poprawne parsowanie wszystkich pól
    const pageData: PageContentData = {
      ...formattedData,
      GalleryImages: formattedData.GalleryImages
        ? formattedData.GalleryImages.split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      GalleryVideos: formattedData.GalleryVideos
        ? formattedData.GalleryVideos.split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      Offers: formattedData.Offers
        ? (() => {
            try {
              return JSON.parse(formattedData.Offers);
            } catch {
              return [];
            }
          })()
        : [],
      NaDobyBezPaliwa: formattedData.NaDobyBezPaliwa
        ? formattedData.NaDobyBezPaliwa.split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      NaDobyZPaliwem: formattedData.NaDobyZPaliwem
        ? formattedData.NaDobyZPaliwem.split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      PrzejazdSkuterem: formattedData.PrzejazdSkuterem
        ? formattedData.PrzejazdSkuterem.split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      // PrzejazdPontonem zostaje jako string
    };

    // Sprawdź, czy parsowanie Offers się powiodło i czy jest to tablica
    if (!Array.isArray(pageData.Offers)) {
      console.warn(
        "[HomePage] Parsed 'Offers' is not an array. Setting to empty array."
      );
      pageData.Offers = [];
    }

    console.log("[HomePage] Formatted content data ready.");
    return pageData;
  } catch (error) {
    console.error("[HomePage] Failed to fetch or process content data:", error);
    // Zwróć domyślne wartości lub pusty obiekt w razie błędu, aby strona się nie wywaliła
    return {
      GalleryImages: [],
      GalleryVideos: [],
      Offers: [],
    };
  }
}

export default async function HomePage() {
  // Pobieranie danych bezpośrednio na serwerze
  const contentData = await getContentData();

  // Dane są już przetworzone w getContentData, nie trzeba tu parsować
  const {
    GalleryImages = [],
    GalleryVideos = [],
    Offers = [],
    HeaderIMG,
    AboutP,
    AboutIMG,
    Map: mapSrc, // Zmiana nazwy, żeby uniknąć konfliktu z 'Map'
    FooterLocation,
    FooterPhone,
    FooterEmail,
  } = contentData;

  return (
    <>
      <Preloader />
      <Navbar />
      <Header backgroundImageUrl={HeaderIMG || "/default-banner.jpg"} />
      <IntroSection
        text={AboutP || ""}
        imageUrl={AboutIMG || "/default-about.jpg"}
      />
      <DescriptionCards /> {/* Zakładam, że statyczne */}
      <OffersSection offers={Offers} />
      <ReservationSection
        mapSrc={mapSrc || ""} // <-- POPRAWKA
        phoneNumber={FooterPhone || ""} // <-- POPRAWKA
        offerTitles={Offers.map((o: Offer) => o.title)}
      />
      <GallerySection images={GalleryImages} videos={GalleryVideos} />
      <ContactSection
        location={FooterLocation || ""} // <-- POPRAWKA
        phone={FooterPhone || ""} // <-- POPRAWKA
        email={FooterEmail || ""} // <-- POPRAWKA
      />
      <Footer
        location={FooterLocation || ""} // <-- POPRAWKA
        phone={FooterPhone || ""} // <-- POPRAWKA
        email={FooterEmail || ""} // <-- POPRAWKA
      />
      <Script src="/js/scripts.js" strategy="lazyOnload" />
    </>
  );
}
