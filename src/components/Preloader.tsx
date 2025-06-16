// src/components/Preloader.tsx
'use client'; // Prawdopodobnie będzie to komponent kliencki, jeśli ma logikę JS do ukrywania się

import React, { useState, useEffect } from 'react';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prosta symulacja końca ładowania po krótkim czasie
    // W realnej aplikacji można by czekać na załadowanie danych lub inne zdarzenie
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Krótkie opóźnienie dla demonstracji

    return () => clearTimeout(timer); // Czyszczenie timera
  }, []);

  // Jeśli używasz oryginalnego HTML/CSS preleadera:
  if (!loading) return null; // Nie renderuj nic, gdy ładowanie zakończone

  return (
    <div className="spinner-wrapper" style={{ display: loading ? 'block' : 'none' }}>
      <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    </div>
  );
};

export default Preloader;