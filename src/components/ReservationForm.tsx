// src/components/ReservationForm.tsx
"use client"; // Komponent kliencki

import React, { useState, useEffect } from "react";

interface ReservationFormProps {
  offerTitles: string[]; // Tytuły ofert do selecta
}

const ReservationForm: React.FC<ReservationFormProps> = ({ offerTitles }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    startDate: "",
    endDate: "",
    powerboat: "",
    annotation: "",
    lterms: false,
  });
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Efekt do inicjalizacji validator.js (jeśli nadal go używasz)
  // useEffect(() => {
  //   // Jeśli validator.js jest załadowany globalnie
  //   // @ts-ignore (jeśli nie masz typów dla validatora)
  //   $('#callMeForm').validator();
  // }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Resetowanie błędów przy zmianie
    if (name === "phone") setPhoneError("");
    if (name === "startDate" || name === "endDate") setDateError("");
  };

  const validateForm = (): boolean => {
    let hasErrors = false;
    // Walidacja numeru telefonu
    const phoneRegex = /^\d{3}-\d{3}-\d{3}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError("Numer telefonu musi mieć format xxx-xxx-xxx.");
      hasErrors = true;
    } else {
      setPhoneError("");
    }

    // Walidacja daty
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (formData.startDate && formData.endDate && startDate > endDate) {
      setDateError("Data początkowa nie może być późniejsza niż data końcowa.");
      hasErrors = true;
    } else {
      setDateError("");
    }

    return !hasErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");

    if (!validateForm()) {
      return;
    }
    if (!formData.lterms) {
      setSubmitMessage("Musisz zaakceptować regulamin."); // Prosty komunikat
      return;
    }

    setSubmitting(true);

    const dataToSend = {
      ...formData,
      annotation: formData.annotation === "" ? "Brak" : formData.annotation,
    };

    try {
      // Zamiast window.location.origin, użyjemy ścieżki względnej dla API Routes
      const response = await fetch(`/api/reservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(result.message || "Zapytanie wysłane pomyślnie!");
        // Resetowanie formularza
        setFormData({
          firstname: "",
          lastname: "",
          phone: "",
          startDate: "",
          endDate: "",
          powerboat: "",
          annotation: "",
          lterms: false,
        });
        // Resetowanie selecta (jeśli to konieczne)
        const formElement = event.target as HTMLFormElement;
        formElement.reset();
      } else {
        console.error("Error:", result);
        setSubmitMessage(
          result.message || "Wysłanie zapytania nie powiodło się."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitMessage("Wystąpił błąd podczas wysyłania zapytania.");
    } finally {
      setSubmitting(false);
    }
  };

  // Efekt do obsługi kliknięcia przycisku "ZAREZERWUJ" z karty oferty
  // To wymaga bardziej zaawansowanej logiki, np. Context API lub Zustand,
  // aby komponent OfferCard mógł zaktualizować stan w ReservationForm.
  // Prostsze rozwiązanie: przekazanie funkcji setFormData do OfferCard (prop drilling)
  // lub użycie ID i querySelector jak w oryginale (mniej "Reactowe")
  // useEffect(() => {
  //   const handleReservationClick = (event: Event) => {
  //       const target = event.target as HTMLElement;
  //       if (target.classList.contains('reservation-btn')) {
  //           event.preventDefault();
  //           const card = target.closest('.card');
  //           if (card) {
  //               const offerTitle = card.querySelector('.card-title')?.textContent;
  //               if (offerTitle) {
  //                   setFormData(prev => ({ ...prev, powerboat: offerTitle }));
  //                   // Przewijanie
  //                   document.querySelector('#reservation')?.scrollIntoView({ behavior: 'smooth' });
  //               }
  //           }
  //       }
  //   };

  //   // Nasłuchujemy na kliknięcia w całym dokumencie
  //   document.addEventListener('click', handleReservationClick);

  //   // Sprzątanie
  //   return () => {
  //       document.removeEventListener('click', handleReservationClick);
  //   };
  // }, [setFormData]); // Dodajemy setFormData jako zależność

  return (
    <form id="callMeForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-control-input"
          id="firstname"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
        <label className="label-control" htmlFor="firstname">
          Imię
        </label>
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control-input"
          id="lastname"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <label className="label-control" htmlFor="lastname">
          Nazwisko
        </label>
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control-input"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <label className="label-control" htmlFor="phone">
          Telefon
        </label>
        {phoneError && (
          <div
            className="help-block with-errors"
            style={{ color: "red", marginTop: "5px" }}
          >
            {phoneError}
          </div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="startDate" style={{ color: "white" }}>
          Od kiedy?
        </label>
        <input
          type="datetime-local"
          className="form-control-input"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="endDate" style={{ color: "white" }}>
          Do kiedy?
        </label>
        <input
          type="datetime-local"
          className="form-control-input"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
        {dateError && (
          <div
            className="help-block with-errors"
            style={{ color: "red", marginTop: "5px" }}
          >
            {dateError}
          </div>
        )}
      </div>
      <div className="form-group">
        <select
          className="form-control-select"
          id="formSelect"
          name="powerboat"
          value={formData.powerboat}
          onChange={handleChange}
          required
        >
          <option className="select-option" value="" disabled>
            Wybierz sprzęt...
          </option>
          {offerTitles.map((title) => (
            <option key={title} className="select-option" value={title}>
              {title}
            </option>
          ))}
         
        </select>
      </div>
      <div className="form-group">
        <textarea
          className="form-control-input"
          id="annotation"
          name="annotation"
          value={formData.annotation}
          onChange={handleChange}
        ></textarea>
        <label className="label-control" htmlFor="annotation">
          Uwagi
        </label>
      </div>
      <div className="form-group checkbox white flex items-start gap-x-2"> {/* Dodano: flex items-start gap-x-2 */}
        <input
          type="checkbox"
          id="lterms"
          name="lterms"
          checked={formData.lterms}
          onChange={handleChange}
          required
          className="mt-1" // Opcjonalnie: Dodaj niewielki margines górny, jeśli items-start nie wyrównuje idealnie
        />
        {/* Usunięto style={{ marginLeft: '5px' }} - teraz załatwia to gap-x-2 */}
          I agree with ZazaWaters&apos; stated{" "}
          <a className="white" href="/privacy-policy">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a className="white" href="/terms-conditions">
            Terms & Conditions
          </a>
      </div>
      <div className="form-group">
        <button
          type="submit"
          className="form-control-submit-button"
          disabled={submitting}
        >
          {submitting ? "WYSYŁANIE..." : "WYŚLIJ"}
        </button>
      </div>
      {submitMessage && (
        <div
          className="form-message"
          style={{ color: "white", marginTop: "15px", textAlign: "center" }}
        >
          {submitMessage}
        </div>
      )}
    </form>
  );
};

export default ReservationForm;
