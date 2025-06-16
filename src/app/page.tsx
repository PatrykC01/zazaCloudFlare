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
import prisma from "@/lib/prisma"; // Zaimportuj klienta Prisma
import { Offer } from "@/app/adminPanel/_actions/contentActions"; // Zaimportuj typ Offer (dostosuj ścieżkę)

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
    console.log("[HomePage] Fetching content data from DB...");
    const allContentFromDb = await prisma.content.findMany();
    console.log(`[HomePage] Fetched ${allContentFromDb.length} items.`);

    // Przekształć dane z bazy w obiekt
    const formattedData: { [key: string]: string } = allContentFromDb.reduce(
      (acc, item) => {
        acc[item.tagName] = item.tagContent;
        return acc;
      },
      {} as { [key: string]: string }
    );

    // Przetwórz specyficzne pola (stringi na tablice/obiekty)
    const pageData: PageContentData = {
      ...formattedData, // Skopiuj wszystkie pobrane pola
      GalleryImages: formattedData.GalleryImages
        ? formattedData.GalleryImages.split(",")
            .map((s) => s.trim())
            .filter(Boolean) // Bezpieczne parsowanie
        : [],
      GalleryVideos: formattedData.GalleryVideos
        ? formattedData.GalleryVideos.split(",")
            .map((s) => s.trim())
            .filter(Boolean) // Bezpieczne parsowanie
        : [],
      Offers: formattedData.Offers
        ? JSON.parse(formattedData.Offers) // Parsuj JSON z ofertami
        : [],
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
     <Header backgroundImageUrl={HeaderIMG || '/default-banner.jpg'} />
      <IntroSection text={AboutP} imageUrl={AboutIMG} />
      <DescriptionCards /> {/* Zakładam, że statyczne */}
      <OffersSection offers={Offers} />
      <ReservationSection
        mapSrc={mapSrc}
        phoneNumber={FooterPhone}
        offerTitles={Offers.map((o: Offer) => o.title)} // Typujemy 'o' jako Offer
      />
      <GallerySection images={GalleryImages} videos={GalleryVideos} />
      <ContactSection
        location={FooterLocation}
        phone={FooterPhone}
        email={FooterEmail}
      />
      <Footer
        location={FooterLocation}
        phone={FooterPhone}
        email={FooterEmail}
      />
      <Script src="/js/scripts.js" strategy="lazyOnload" />
    </>
  );
}
