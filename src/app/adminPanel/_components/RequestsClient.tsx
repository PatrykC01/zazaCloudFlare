// app/cms/_components/RequestsClient.tsx
"use client";

import React, { useState, useTransition, useCallback, useEffect } from "react";
import {
  getRequests,
  deleteRequest,
  acceptRequest,
} from "../_actions/reservationActions";
import { CheckIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/solid"; // Ikony dla przycisków

// Define a local Request type based on your Supabase REST API response
interface RequestModel {
  id: number;
  powerboat: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  annotation: string;
  startDate: string;
  endDate: string;
  // Add any other fields returned by Supabase if needed
}

interface RequestsClientProps {
  initialRequests: RequestModel[];
}

export default function RequestsClient({
  initialRequests,
}: RequestsClientProps) {
  const [requests, setRequests] = useState<RequestModel[]>(initialRequests);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false); // Do ręcznego odświeżania
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null); // ID zapytania, na którym trwa akcja

  // Funkcja do odświeżania listy zapytań
  const refreshRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Resetuj błąd przed odświeżeniem
    try {
      const updatedRequests = await getRequests();
      setRequests(updatedRequests);
    } catch (err) {
      console.error("Błąd odświeżania zapytań:", err);
      setError("Nie udało się odświeżyć listy zapytań.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handler dla akceptacji zapytania
  const handleAccept = (requestId: number) => {
    if (isPending) return; // Nie wykonuj akcji, jeśli inna jest w toku
    setPendingActionId(requestId); // Ustaw ID przetwarzanego elementu
    setError(null); // Wyczyść poprzednie błędy
    startTransition(async () => {
      const result = await acceptRequest(requestId);
      if (result.success) {
        // Usuń zaakceptowane zapytanie z lokalnego stanu dla natychmiastowej reakcji UI
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        // RevalidatePath w akcji serwerowej odświeży dane przy następnym ładowaniu/nawigacji
      } else {
        console.error(
          `Błąd akceptacji zapytania ${requestId}:`,
          result.message
        );
        setError(
          result.message || `Nie udało się zaakceptować zapytania ${requestId}.`
        );
      }
      setPendingActionId(null); // Zdejmij blokadę ID
    });
  };

  // Handler dla odrzucenia (usunięcia) zapytania
  const handleDelete = (requestId: number) => {
    if (isPending) return;
    setPendingActionId(requestId);
    setError(null);
    startTransition(async () => {
      const result = await deleteRequest(requestId);
      if (result.success) {
        // Usuń odrzucone zapytanie z lokalnego stanu
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        console.error(`Błąd usuwania zapytania ${requestId}:`, result.message);
        setError(
          result.message || `Nie udało się usunąć zapytania ${requestId}.`
        );
      }
      setPendingActionId(null);
    });
  };

  // Opcjonalnie: Odświeżaj listę co jakiś czas lub przy focusie okna
  // useEffect(() => { /* ... logika odświeżania ... */ }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Oczekujące Zapytania ({requests.length})
        </h2>
        <button
          onClick={refreshRequests}
          className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          disabled={isLoading || isPending}
          title="Odśwież listę"
        >
          <p>Reload</p>
        </button>
      </div>
      {/* Komunikat o błędzie */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          <strong>Błąd:</strong> {error}
        </div>
      )}
      {isPending && !isLoading && pendingActionId === null && (
        <div className="text-center my-4">Przetwarzanie...</div>
      )}{" "}
      {/* Ogólne przetwarzanie */}
      {requests.length === 0 && !isLoading ? (
        <p className="text-gray-500">Brak oczekujących zapytań.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`border p-4 rounded shadow-md transition-opacity duration-300 ${
                pendingActionId === req.id
                  ? "opacity-50 bg-gray-100"
                  : "bg-white"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                {/* Dane Zapytania */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">
                    {req.firstName} {req.lastName}
                  </h3>
                  <p className="text-gray-700">{req.powerboat}</p>
                  <p className="text-sm text-gray-600">
                    Tel: {req.phoneNumber}
                  </p>
                  <div className="text-sm mt-1">
                    <p>
                      Od:{" "}
                      <span className="font-medium">
                        {new Date(req.startDate).toLocaleString("pl-PL")}
                      </span>
                    </p>
                    <p>
                      Do:{" "}
                      <span className="font-medium">
                        {new Date(req.endDate).toLocaleString("pl-PL")}
                      </span>
                    </p>
                  </div>
                  {req.annotation && req.annotation !== "Brak" && (
                    <p className="text-sm mt-2 italic bg-yellow-50 p-2 rounded border border-yellow-200">
                      Uwagi: {req.annotation}
                    </p>
                  )}
                </div>

                {/* Przyciski Akcji */}
                <div className="flex flex-shrink-0 gap-2 mt-2 md:mt-0">
                  {/* Przycisk Akceptuj */}
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending} // Blokuj wszystkie przyciski podczas dowolnej akcji
                    title="Akceptuj i utwórz rezerwację"
                  >
                    {pendingActionId === req.id ? <p>V</p> : <p>V</p>}
                  </button>

                  {/* Przycisk Odrzuć */}
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending}
                    title="Odrzuć zapytanie"
                  >
                    {pendingActionId === req.id ? <p>X</p> : <p>X</p>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Wskaźnik ładowania na dole */}
      {isLoading && (
        <div className="text-center mt-4 text-gray-500">
          Odświeżanie listy...
        </div>
      )}
    </div>
  );
}
