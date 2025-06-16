// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script"; // Ważne dla ładowania skryptów JS
import { Montserrat, Open_Sans } from "next/font/google"; // Lepsze zarządzanie fontami

import "@/app/globals.css"; // Podstawowe globalne style Next.js
// Importuj swoje globalne CSS tutaj
import SessionProviderWrapper from './SessionProviderWrapper'; // Zaimportuj wrapper
import "../../public/css/bootstrap.css";
import "../../public/css/fontawesome-all.css";
import "../../public/css/swiper.css";
import "../../public/css/magnific-popup.css";
import "../../public/css/styles.css";
// Font Awesome 6 z CDN (alternatywa dla lokalnego pliku)
// import Head from 'next/head'; // Niepotrzebne w App Router dla <link>

// Konfiguracja fontów za pomocą next/font (zalecane)
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-montserrat", // Opcjonalnie, dla użycia jako zmienna CSS
});

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-open-sans", // Opcjonalnie
});

// Metadane (zastępuje tagi <meta> i <title> w <head>)
export const metadata: Metadata = {
  title: "Zaza__Waters - Wypożyczalnia skuterów wodnych",
  description: "Twoje SEO description tutaj...", // Uzupełnij opis
  // Możesz dodać więcej metadanych, w tym OG tags
  openGraph: {
    title: "Zaza__Waters - Wypożyczalnia",
    description: "Twoje OG description...",
    // url: 'https://twojadomena.pl', // Dodaj URL strony
    // siteName: 'Zaza__Waters',
    // images: [ { url: '/images/og-image.jpg' } ], // Ścieżka do obrazka w public/
    type: "website", // lub 'article'
  },
  // Favicon (jeśli nie jest w app/favicon.ico)
  // icons: {
  //   icon: '/images/favicon.png',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Możesz użyć zmiennych fontów w CSS:
        font-family: var(--font-montserrat);
        lub po prostu pozwolić Next.js zarządzać nimi globalnie przez className
      */}
      <body className={`${montserrat.variable} ${openSans.variable}`}>
      <SessionProviderWrapper>
        {/* Preloader (można przenieść do komponentu Client-Side) */}
        {/* <div className="spinner-wrapper">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </div> */}
        {/* Tutaj umieścimy komponenty Navbar i Footer, które są na każdej stronie */}
        {/* <Navbar /> */}
        {children} {/* Tutaj będzie renderowana zawartość strony (page.tsx) */}
        </SessionProviderWrapper>
        {/* <Footer /> */}
        {/* Ładowanie skryptów JS */}
        {/* Strategia 'beforeInteractive' dla krytycznych skryptów jak jQuery */}
        <Script src="/js/jquery.min.js" strategy="beforeInteractive" />
        {/* Strategia 'afterInteractive' (domyślna) dla reszty */}
        <Script src="/js/popper.min.js" />
        <Script src="/js/bootstrap.min.js" />
        <Script src="/js/jquery.easing.min.js" />
        <Script src="/js/swiper.min.js" />
        <Script src="/js/jquery.magnific-popup.js" />
        <Script src="/js/morphext.min.js" />
        <Script src="/js/isotope.pkgd.min.js" />
        <Script src="/js/validator.min.js" />
        {/* Customowe skrypty najlepiej ładować na końcu */}
        {/* <Script src="/js/scripts.js" strategy="lazyOnload" /> */}
        {/* form.js zostanie przeniesiony do komponentu formularza */}
        {/* Dodajemy Font Awesome 6 z CDN, jeśli nie masz lokalnie */}
        {/* <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/js/all.min.js"
          integrity="sha512-6PM0qYu5KExuNcKt5bURAoT6KCThUmHRewN3zUFNaoI6Di7XJPTMoT6K0nsagZKk2OB4L7E3q1uQKHNHPEqIQg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="lazyOnload"
        ></Script> */}
      </body>
    </html>
  );
}
