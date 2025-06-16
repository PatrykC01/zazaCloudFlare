// src/components/ReservationSection.tsx
import React from "react";
import ReservationForm from "./ReservationForm"; // Importuj komponent formularza

interface ReservationSectionProps {
  mapSrc: string;
  phoneNumber: string;
  offerTitles: string[];
}

const ReservationSection: React.FC<ReservationSectionProps> = ({
  mapSrc,
  phoneNumber,
  offerTitles,
}) => {
  return (
    <div id="reservation" className="form-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="text-container">
              <div className="section-title" style={{ lineHeight: "35px" }}>
                Wyślij zapytanie o rezerwacje
              </div>
              <h2 className="white">
                Skontaktuj się z nami wypełniając formularz lub dzwoniąc na
                numer <br />{" "}
                <a
                  id="ReservationPhone"
                  href={`tel:${phoneNumber}`}
                  style={{ color: "antiquewhite" }}
                >
                  {phoneNumber}
                </a>
              </h2>
              <p className="white">
              Chcesz zarezerwować swoją wodną przygodę? Skontaktuj się z nami, aby zarezerwować skuter wodny i przeżyć niezapomniane chwile na wodzie! Wypełnij poniższy formularz, a my szybko odpowiemy na Twoje pytania i potwierdzimy dostępność. Jesteśmy tu, aby pomóc Ci zaplanować idealny dzień pełen emocji. Czekamy na Twój kontakt!{" "}
                {/* Pełny tekst */}
              </p>
              <ul className="list-unstyled li-space-lg white">
                {/* ... list items ... */}
                <li className="media">
                  <i className="fas fa-square"></i>
                  <div className="media-body">
                    Wyślij do nas prośbę o rezerwacje
                  </div>
                </li>
                <li className="media">
                  <i className="fas fa-square"></i>
                  <div className="media-body">
                  Jeśli termin będzie wolny skontaktujemy się z tobą
                  </div>
                </li>
                <li className="media">
                  <i className="fas fa-square"></i>
                  <div className="media-body">
                  W razie pytań lub wątpliwości służymy pomocą 🙂
                  </div>
                </li>
              </ul>
            </div>
            <h2 style={{ textAlign: "center" }}>Aktualnie znajdujemy się:</h2>
            <iframe
              id="Map"
              src={mapSrc}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true} // Zmień na boolean
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          {/* end of col */}
          <div className="col-lg-6">
            {/* Umieść tutaj komponent formularza */}
            <ReservationForm offerTitles={offerTitles} />
          </div>
          {/* end of col */}
        </div>
        {/* end of row */}
      </div>
      {/* end of container */}
    </div>
    /* end of form-1 */
  );
};

export default ReservationSection;
