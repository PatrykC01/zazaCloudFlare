// src/app/adminPanel/_components/FilterPanel.tsx
"use client";
import React from 'react';

// 1. Zdefiniuj interfejs dla propsów
interface FilterPanelProps {
  onApplyFilters: (filters: string) => void;
  onClose: () => void;
}

// 2. Powiedz komponentowi, żeby używał tego interfejsu dla swoich propsów
export default function FilterPanel({ onApplyFilters, onClose }: FilterPanelProps) {
  // Teraz możesz używać `onApplyFilters` i `onClose` wewnątrz komponentu,
  // np. przypisując je do przycisków.
  
  return (
    <div className="filter-panel"> {/* Możesz dodać jakieś style */}
      <h2>Filtry</h2>
      {/* Tutaj umieść swoje pola formularza filtrów */}
      
      <button onClick={() => onApplyFilters("jakieś-filtry")}>Zastosuj</button>
      <button onClick={onClose}>Zamknij</button>
    </div>
  );
}