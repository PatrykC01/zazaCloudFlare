// app/cms/_components/ReservationForm.tsx
import React, { useState, useEffect } from "react";
import { ReservationData } from "../_actions/reservationActions";

interface ReservationFormProps {
  onSubmit: (data: ReservationData) => Promise<void> | void;
  initialData?: ReservationData | null;
  isSubmitting: boolean;
  onCancel?: () => void; // Dla przycisku Anuluj w trybie edycji
}

// Funkcja do formatowania daty dla input type="datetime-local" (YYYY-MM-DDTHH:mm)
const formatDateTimeLocal = (date: Date | string | undefined): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Zwraca np. "2025-04-18T11:00"
  } catch {
    return "";
  }
};

export default function ReservationForm({
  onSubmit,
  initialData,
  isSubmitting,
  onCancel,
}: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationData>(() => {
    const now = new Date();
    const defaultStartDate = formatDateTimeLocal(now);
    const defaultEndDate = formatDateTimeLocal(
      new Date(now.getTime() + 60 * 60 * 1000)
    ); // +1 godzina
    return {
      powerboat:
        initialData?.powerboat ||
        "Sea-Doo Spark Trixx 3 UP NEW Dragon Red and Bright White 2024",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phoneNumber: initialData?.phoneNumber || "",
      annotation: initialData?.annotation || "Brak",
      startDate: initialData?.startDate || defaultStartDate,
      endDate: initialData?.endDate || defaultEndDate,
    };
  });

  // Błędy walidacji (prosty przykład, lepiej użyć react-hook-form)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Aktualizacja stanu przy zmianie initialData (dla edycji)
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Wyczyść błąd dla zmienianego pola
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === "startDate" && value) {
        const newStartDate = new Date(value);
        const newEndDate = formatDateTimeLocal(new Date(newStartDate.getTime() + 60 * 60 * 1000));
        updatedData.endDate = newEndDate;
      }
      return updatedData;
    });
    if (errors.startDate || errors.endDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Prosta walidacja po stronie klienta
  const newErrors: Record<string, string> = {};
  if (!formData.firstName) newErrors.firstName = "Imię jest wymagane";
  if (!formData.lastName) newErrors.lastName = "Nazwisko jest wymagane";
  if (!formData.phoneNumber) {
    newErrors.phoneNumber = "Numer telefonu jest wymagany";
  } else if (!/^\d{3}-\d{3}-\d{3}$/.test(formData.phoneNumber)) {
    newErrors.phoneNumber = "Nieprawidłowy format numeru (xxx-xxx-xxx)";
  }
  if (!formData.startDate) newErrors.startDate = "Data początkowa jest wymagana";
  if (!formData.endDate) newErrors.endDate = "Data końcowa jest wymagana";
  if (
    formData.startDate &&
    formData.endDate &&
    new Date(formData.endDate) <= new Date(formData.startDate)
  ) {
    newErrors.endDate = "Data końcowa musi być późniejsza niż początkowa";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  // Konwersja dat do formatu ISO
  const startDateISO = formData.startDate ? new Date(formData.startDate).toISOString() : "";
  const endDateISO = formData.endDate ? new Date(formData.endDate).toISOString() : "";

  const dataToSend = {
    ...formData,
    startDate: startDateISO,
    endDate: endDateISO,
  };
  onSubmit(dataToSend);
};

  return (
    <form onSubmit={handleSubmit} className="needs-validation space-y-4">
      {" "}
      {/* Klasa z Blazora */}
      {/* Komunikat o błędach globalnych (jeśli Server Action zwróci ogólny błąd) */}
      {errors.general && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {errors.general}
        </div>
      )}
      <div>
        <label
          htmlFor="powerboat"
          className="form-label block mb-1 font-medium"
        >
          Wybierz motorówkę:
        </label>
        <select
          name="powerboat"
          id="powerboat"
          value={formData.powerboat}
          onChange={handleChange}
          className={`form-select w-full p-2 border rounded ${
            errors.powerboat ? "border-red-500" : "border-gray-300"
          }`} // Użyj swoich klas CSS
          disabled={isSubmitting}
        >
          {/* Daj wartości zgodne z C# */}
          <option value="Sea-Doo Spark Trixx 3 UP NEW Dragon Red and Bright White 2024">
            Sea-Doo Spark Trixx 3 UP NEW Dragon Red and Bright White 2024
          </option>
          <option value="Jobe Proton 2P">Jobe Proton 2P</option>
        </select>
        {errors.powerboat && (
          <p className="text-red-500 text-sm mt-1">{errors.powerboat}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label block mb-1 font-medium">Od kiedy:</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formatDateTimeLocal(formData.startDate)}
            onChange={handleDateChange}
            className={`form-control w-full p-2 border rounded ${
              errors.startDate ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label className="form-label block mb-1 font-medium">Do kiedy:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formatDateTimeLocal(formData.endDate)}
            onChange={handleDateChange}
            className={`form-control w-full p-2 border rounded ${
              errors.endDate ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>
      <fieldset className="border p-4 rounded space-y-3">
        <legend className="w-auto px-2 font-medium">Dane klienta</legend>
        <div>
          <label htmlFor="firstName" className="form-label block mb-1">
            Imię:
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`form-control w-full p-2 border rounded ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="form-label block mb-1">
            Nazwisko:
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`form-control w-full p-2 border rounded ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
        <div>
          <label htmlFor="phoneNumber" className="form-label block mb-1">
            Numer telefonu:
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="xxx-xxx-xxx"
            className={`form-control w-full p-2 border rounded ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>
      </fieldset>
      <div>
        <label htmlFor="annotation" className="form-label block mb-1">
          Uwagi:
        </label>
        <textarea
          name="annotation"
          id="annotation"
          value={formData.annotation}
          onChange={handleChange}
          className="form-control w-full p-2 border rounded border-gray-300"
          rows={3}
          disabled={isSubmitting}
        ></textarea>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="btn btn-success btn-lg btn-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50" // Klasy z Blazora i Tailwind
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Zapisywanie..."
            : initialData
            ? "Zaktualizuj Rezerwację"
            : "Dodaj Rezerwację"}
        </button>
        {onCancel && ( // Pokaż przycisk Anuluj tylko w trybie edycji
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={isSubmitting}
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
