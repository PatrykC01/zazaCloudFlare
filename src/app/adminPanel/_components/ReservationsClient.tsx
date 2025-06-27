// app/cms/_components/ReservationsClient.tsx
"use client";

import React, { useState, useTransition, useEffect } from "react";
import type { ReservationData } from "@/types/reservation";
import ReservationCard from "./ReservationCard";
import ReservationForm from "./ReservationForm";
import ConfirmationModal from "./ConfirmationModal";
import FilterPanel from "./FilterPanel";

// Typ dla obiektu rezerwacji pobranego z serwera (może zawierać ID)
type ReservationFromServer = ReservationData & { id: number };

// --- API helpers ---
type ReservationFilters = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  powerboat?: string;
  annotation?: string;
  startDate?: string;
  endDate?: string;
};

const buildFilterQuery = (filters: ReservationFilters) => {
  const params: string[] = [];
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "startDate" || key === "endDate") {
        // Filtruj daty >= lub <=
        if (key === "startDate") params.push(`${key}=gte.${value}`);
        if (key === "endDate") params.push(`${key}=lte.${value}`);
      } else {
        // Przekazuj czystą wartość, wildcardy i ilike dokleja backend
        params.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
  });
  return params.join("&");
};

const fetchReservations = async (
  sortValue: string,
  sortDir: string,
  filters: ReservationFilters = {}
) => {
  const filterQuery = buildFilterQuery(filters);
  const url =
    `/api/reservation?sortBy=${sortValue}&sortDir=${sortDir}` +
    (filterQuery ? `&${filterQuery}` : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
  return await res.json();
};

const createReservationApi = async (data: ReservationData) => {
  // Zamień klucze na takie, jakich oczekuje backend
  const payload = {
    firstname: data.firstName,
    lastname: data.lastName,
    phone: data.phoneNumber,
    powerboat: data.powerboat,
    startDate: data.startDate,
    endDate: data.endDate,
    annotation: data.annotation,
  };
  const res = await fetch("/api/reservation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

const updateReservationApi = async (id: number, data: ReservationData) => {
  const res = await fetch(`/api/reservation?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return await res.json();
};

const deleteReservationApi = async (id: number) => {
  const res = await fetch(`/api/reservation?id=${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return await res.json();
};

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<ReservationFromServer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<ReservationFromServer | null>(null);
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservationFromServer | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [sortValue, setSortValue] = useState("startDate");
  const [sortDesc, setSortDesc] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState<ReservationFilters>({});

  useEffect(() => {
    fetchReservations(sortValue, sortDesc ? "desc" : "asc", filters).then(
      (data) => {
        if (Array.isArray(data)) setReservations(data);
        else setReservations([]);
      }
    );
  }, [sortValue, sortDesc, filters]);

  const handleCreate = async (data: ReservationData) => {
    startTransition(async () => {
      const result = await createReservationApi(data);
      if (result.success) {
        setShowCreateForm(false);
        // Ponowne pobranie danych po sukcesie
        const updatedReservations = await fetchReservations(
          sortValue,
          sortDesc ? "desc" : "asc"
        );
        setReservations(updatedReservations);
      } else {
        console.error("Błąd tworzenia:", result.message);
        alert(`Błąd: ${result.message}`);
      }
    });
  };

  const handleUpdate = async (data: ReservationData) => {
    if (!editingReservation) return;
    startTransition(async () => {
      const result = await updateReservationApi(editingReservation.id, data);
      if (result.success) {
        setEditingReservation(null);
        // Ponowne pobranie danych po sukcesie
        const updatedReservations = await fetchReservations(
          sortValue,
          sortDesc ? "desc" : "asc"
        );
        setReservations(updatedReservations);
      } else {
        console.error("Błąd aktualizacji:", result.message);
        alert(`Błąd: ${result.message}`);
      }
    });
  };

  const handleDeleteConfirm = (reservation: ReservationFromServer) => {
    console.log("Delete clicked for reservation ID:", reservation.id);
    setReservationToDelete(reservation); // Ustawia rezerwację do usunięcia
    console.log("Setting reservationToDelete to:", reservation);
    setIsDeleteModalOpen(true); // Otwiera modal
  };

  const handleDelete = () => {
    if (!reservationToDelete) return; // Sprawdź, czy jest co usuwać
    startTransition(async () => {
      const result = await deleteReservationApi(reservationToDelete.id);
      if (result.success) {
        // Po sukcesie: zresetuj rezerwację do usunięcia I ZAMKNIJ MODAL
        setReservationToDelete(null);
        setIsDeleteModalOpen(false); // !!! DODANE: Zamyka modal po sukcesie !!!
        // Ponowne pobranie danych po sukcesie
        const updatedReservations = await fetchReservations(
          sortValue,
          sortDesc ? "desc" : "asc"
        );
        setReservations(updatedReservations);
      } else {
        console.error("Błąd usuwania:", result.message);
        alert(`Błąd: ${result.message}`);
        // Po błędzie: zresetuj rezerwację do usunięcia I ZAMKNIJ MODAL
        setReservationToDelete(null);
        setIsDeleteModalOpen(false); // !!! DODANE: Zamyka modal nawet przy błędzie !!!
      }
    });
  };

  // Funkcja do obsługi anulowania w modalu (lub kliknięcia "X" / tła jeśli modal to obsługuje)
  const handleCancelDelete = () => {
    // Resetuje rezerwację do usunięcia I ZAMYKA MODAL
    setReservationToDelete(null);
    setIsDeleteModalOpen(false); // !!! POPRAWIONE: Ustawia na false !!!
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortValue(e.target.value);
    // W przypadku sortowania po stronie klienta, useEffect zareaguje na zmianę sortValue
  };

  const toggleSortDirection = () => {
    setSortDesc(!sortDesc);
    // W przypadku sortowania po stronie klienta, useEffect zareaguje na zmianę sortDesc
  };

  const handleApplyFilters = (newFilters: ReservationFilters) => {
    setFilters(newFilters);
    setIsFiltered(Object.values(newFilters).some((v) => v));
    setShowFilterPanel(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setIsFiltered(false);
  };

  return (
    <div>
      {/* Przycisk Dodaj / Formularz Dodawania */}
      {!showCreateForm &&
      !editingReservation &&
      !isDeleteModalOpen &&
      !showFilterPanel ? ( // Nie pokazuj przycisku "Dodaj", gdy edytujesz, tworzysz, masz modal lub filtry
        <div className="mb-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            disabled={isPending}
          >
            Dodaj Rezerwację
          </button>
        </div>
      ) : showCreateForm ? ( // Pokaż formularz tworzenia
        <div className="mb-6 p-4 border rounded shadow-lg bg-white relative">
          <button
            onClick={() => setShowCreateForm(false)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl font-bold"
            aria-label="Zamknij formularz"
          >
            ×
          </button>
          <ReservationForm
            onSubmit={handleCreate}
            isSubmitting={isPending}
            onCancel={() => setShowCreateForm(false)} // Dodaj przycisk Anuluj w formularzu tworzenia
          />
        </div>
      ) : null}{" "}
      {/* Nie renderuj nic, gdy edytujesz, masz modal lub filtry */}
      {/* Sekcja Sortowania i Filtrów */}
      {/* Pokaż sekcję sortowania/filtrów tylko gdy nie edytujesz/tworzysz i nie masz otwartego modala/filtrow */}
      {!showCreateForm &&
        !editingReservation &&
        !isDeleteModalOpen &&
        !showFilterPanel && (
          <div className="mb-6 p-4 border rounded shadow-lg bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Sortowanie */}
            <div className="flex items-center gap-2">
              <label htmlFor="sortList" className="font-bold">
                Sortuj:
              </label>
              <select
                id="sortList"
                value={sortValue}
                onChange={handleSortChange}
                className="form-select border p-2 rounded"
                disabled={isPending}
              >
                <option value="firstName">Imię</option>
                <option value="lastName">Nazwisko</option>
                <option value="phoneNumber">Numer Telefonu</option>
                <option value="powerboat">Motorówka</option>
                <option value="startDate">Data od</option>
                <option value="endDate">Data do</option>
                <option value="annotation">Uwagi</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="p-2 border rounded"
                disabled={isPending}
              >
                {sortDesc ? "▼" : "▲"}
              </button>
            </div>
            {/* Filtry */}
            <div>
              {/* Przycisk "Filtry" lub "Wyczyść filtry" zależnie od isFiltered */}
              {isFiltered ? (
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                  disabled={isPending}
                >
                  Wyczyść filtry
                </button>
              ) : (
                <button
                  onClick={() => setShowFilterPanel(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  disabled={isPending}
                >
                  Filtry
                </button>
              )}
            </div>
          </div>
        )}
      {/* Lista Rezerwacji */}
      {isPending && <div className="text-center my-4">Ładowanie...</div>}
      {/* Pokaż listę tylko gdy nie edytujesz/tworzysz i nie masz otwartego modala/filtrow */}
      {!showCreateForm &&
        !editingReservation &&
        !isDeleteModalOpen &&
        !showFilterPanel && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Użyj stanu `reservations` do mapowania */}
            {reservations.map((res) => (
              <ReservationCard
                key={res.id}
                reservation={res}
                onEdit={() => setEditingReservation(res)}
                onDelete={() => handleDeleteConfirm(res)} // Ten handler ustawia reservationToDelete i otwiera modal
                isPending={isPending}
              />
            ))}
          </div>
        )}
      {/* Modale i Formularze nakładające się - RENDERING POZA NORMALNYM PRZEPŁYWEM (opcjonalnie z Portalem) */}
      {/* Modal Potwierdzenia Usunięcia - Pokaż tylko gdy jest rezerwacja do usunięcia I modal ma być otwarty */}
      {/* Dodaj warunek `reservationToDelete` aby upewnić się, że dane są dostępne, mimo że `isDeleteModalOpen` jest głównym kontrolerem */}
      {isDeleteModalOpen &&
        reservationToDelete &&
        (console.log(
          "Rendering ConfirmationModal. isDeleteModalOpen:",
          isDeleteModalOpen,
          "reservationToDelete:",
          reservationToDelete
        ),
        (
          <ConfirmationModal
            isOpen={isDeleteModalOpen} // Ten prop włącza/wyłącza renderowanie wewnątrz modala (return null)
            title="Potwierdź usunięcie"
            // Użyj `reservationToDelete` które jest gwarantowane przez warunek `&& reservationToDelete`
            message={`Czy na pewno chcesz usunąć rezerwację dla klienta ${reservationToDelete.firstName} ${reservationToDelete.lastName}?`}
            onConfirm={handleDelete}
            onCancel={handleCancelDelete} // Anuluj wywołuje handleCancelDelete
            isConfirming={isPending}
            onClose={handleCancelDelete} // 'X' lub kliknięcie tła wywołuje handleCancelDelete
          />
        ))}
      {/* Modal / Panel Filtrów - Pokaż tylko gdy showFilterPanel jest true */}
      {showFilterPanel && (
        <FilterPanel
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilterPanel(false)}
        />
      )}
      {/* Formularz Edycji - Pokaż tylko gdy editingReservation jest true */}
      {editingReservation && (
        // Sugeruję, żeby formularze edycji/dodawania też były nakładką,
        // np. jako inny rodzaj modala (FullScreenModal, SidePanelModal)
        // lub również renderowane przez Portal, jeśli są skomplikowane
        // i mają przykrywać zawartość. Obecnie renderują się "inline".
        <div className="mb-6 p-4 border rounded shadow-lg bg-white relative">
          <button
            onClick={() => setEditingReservation(null)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl font-bold"
            aria-label="Zamknij formularz edycji"
          >
            ×
          </button>
          <ReservationForm
            onSubmit={handleUpdate}
            initialData={editingReservation}
            isSubmitting={isPending}
            onCancel={() => setEditingReservation(null)} // Dodaj przycisk Anuluj w formularzu edycji
          />
        </div>
      )}
    </div>
  );
}
