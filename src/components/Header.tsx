// src/components/Header.tsx
"use client"; // Oznacz jako Client Component, jeśli używasz Morphext lub innego JS tutaj

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface HeaderProps {
  backgroundImageUrl: string;
}

const Header: React.FC<HeaderProps> = ({ backgroundImageUrl }) => {
  const rotatingTextRef = useRef<HTMLSpanElement>(null);

  // Efekt do inicjalizacji Morphext (przykład)
  useEffect(() => {
    const initializeMorphext = () => {
      if (
        rotatingTextRef.current &&
        typeof window !== "undefined" &&
        (window as any).$ &&
        (window as any).$.fn.Morphext
      ) {
        (window as any).$(rotatingTextRef.current).Morphext({
          animation: "fadeIn",
          separator: ",",
          speed: 2000,
        });
      } else {
        setTimeout(initializeMorphext, 100);
      }
    };
    initializeMorphext();
  }, []);

  // Ustal wymiary hero image (np. 1920x800, dostosuj do projektu)
  // Ustal sizes, aby Next.js generował odpowiednie rozmiary
  // Gradient overlay jako osobny div absolutnie pozycjonowany
  return (
    <header
      id="header"
      className="header"
      style={{ position: "relative", overflow: "hidden", minHeight: "60vh" }}
    >
      {/* Hero Image (Next.js optimized) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={backgroundImageUrl}
          alt="Hero background"
          fill
          priority
          quality={75}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </div>
      {/* Content */}
      <div
        className="header-content"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-container">
                <h1>
                  <span ref={rotatingTextRef} id="js-rotating">
                    Wypożyczalnia sprzętu sportowego, Zaza Adventures
                  </span>
                </h1>
                <a className="btn-solid-lg page-scroll" href="#offers">
                  Nasza Oferta
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
