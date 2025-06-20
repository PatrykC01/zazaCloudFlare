// src/components/IntroSection.tsx
import React from "react";
import Image from "next/image"; // Użyj next/image dla optymalizacji

interface IntroSectionProps {
  text: string;
  imageUrl: string;
}

const IntroSection: React.FC<IntroSectionProps> = ({ text, imageUrl }) => {
  return (
    <div id="intro" className="basic-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="text-container">
              <div className="section-title">Na wstępie</div>
              <h2>Trochę o nas</h2>
              {/* Użyj przekazanego tekstu */}
              <p id="AboutP">
                {text || (
                  <span style={{ color: "red" }}>Brak treści AboutP</span>
                )}
              </p>
            </div>
            {/* end of text-container */}
          </div>
          {/* end of col */}
          <div className="col-lg-7">
            <div className="image-container">
              {/* Użyj komponentu Image z Next.js */}
              {/* Wymiary (width, height) są wymagane, chyba że używasz fill */}
              {/* Dostosuj wymiary do swoich potrzeb lub użyj fill i ustaw pozycjonowanie w CSS */}
              <Image
                id="AboutIMG"
                className="img-fluid" // Możesz zostawić, jeśli Bootstrap tego wymaga
                src={imageUrl}
                alt="O nas - zdjęcie"
                width={500} // Przykładowa szerokość
                height={500} // Przykładowa wysokość
                style={{
                  borderRadius: "5px",
                  aspectRatio: "1/1",
                  width: "70%",
                  height: "auto",
                }} // Możesz dostosować style
              />
            </div>
            {/* end of image-container */}
          </div>
          {/* end of col */}
        </div>
        {/* end of row */}
      </div>
      {/* end of container */}
    </div>
    /* end of basic-1 */
  );
};

export default IntroSection;
