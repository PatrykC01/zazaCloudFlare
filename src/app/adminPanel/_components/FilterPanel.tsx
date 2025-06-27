// src/app/adminPanel/_components/FilterPanel.tsx
"use client";
// ...existing code...

import React, { useState } from "react";

interface ReservationFilters {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  powerboat?: string;
  annotation?: string;
  startDate?: string;
  endDate?: string;
}

interface FilterPanelProps {
  onApplyFilters: (filters: ReservationFilters) => void;
  onClose: () => void;
}

export default function FilterPanel({
  onApplyFilters,
  onClose,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<ReservationFilters>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setFilters({});
    onApplyFilters({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Filtry rezerwacji</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="firstName"
            value={filters.firstName || ""}
            onChange={handleChange}
            placeholder="Imię"
            className="w-full border p-2 rounded"
          />
          <input
            name="lastName"
            value={filters.lastName || ""}
            onChange={handleChange}
            placeholder="Nazwisko"
            className="w-full border p-2 rounded"
          />
          <input
            name="phoneNumber"
            value={filters.phoneNumber || ""}
            onChange={handleChange}
            placeholder="Numer telefonu"
            className="w-full border p-2 rounded"
          />
          <input
            name="powerboat"
            value={filters.powerboat || ""}
            onChange={handleChange}
            placeholder="Motorówka"
            className="w-full border p-2 rounded"
          />
          <input
            name="annotation"
            value={filters.annotation || ""}
            onChange={handleChange}
            placeholder="Uwagi"
            className="w-full border p-2 rounded"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs">Data od</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs">Data do</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
            >
              Zastosuj
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded w-full"
            >
              Wyczyść
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
