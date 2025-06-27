// src/components/Header.tsx
'use client'; // Oznacz jako Client Component, jeśli używasz Morphext lub innego JS tutaj

import React, { useEffect, useRef } from 'react';
// Jeśli używasz Morphext, musisz go zaimportować lub upewnić się, że jest globalnie dostępny
// import Morphext from 'morphext'; // Przykładowo

interface HeaderProps {
  backgroundImageUrl: string;
}

const Header: React.FC<HeaderProps> = ({ backgroundImageUrl }) => {
  const rotatingTextRef = useRef<HTMLSpanElement>(null);

  // Efekt do inicjalizacji Morphext (przykład)
  useEffect(() => {
    // Upewnij się, że jQuery i Morphext są załadowane przed tym kodem
    // Może wymagać opóźnienia lub sprawdzenia, czy $ i $.fn.Morphext istnieją
    const initializeMorphext = () => {
        if (rotatingTextRef.current && typeof window !== 'undefined' && (window as any).$ && (window as any).$.fn.Morphext) {
            (window as any).$(rotatingTextRef.current).Morphext({
                animation: "fadeIn", // Twoja animacja
                separator: ",",
                speed: 2000, // Twoja prędkość
                // complete: function () { /* callback */ }
            });
        } else {
            // Spróbuj ponownie za chwilę, jeśli jQuery/Morphext nie są jeszcze gotowe
            setTimeout(initializeMorphext, 100);
        }
    };
    initializeMorphext();

    // Nie ma standardowej metody destroy dla Morphext, więc nie ma czyszczenia
  }, []);


  return (
    <header id="header" className="header" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${backgroundImageUrl})` }}>
      <div className="header-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-container">
                <h1>
                  {/* Użyj ref dla Morphext */}
                  <span ref={rotatingTextRef} id="js-rotating">
                    Wypożyczalnia sprzętu sportowego, Zaza Adventures
                    {/* Dodaj inne frazy oddzielone przecinkiem, jeśli Morphext ma działać */}
                    {/* ,Najlepsze skutery,Niezapomniane wrażenia */}
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