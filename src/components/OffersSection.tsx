// src/components/OffersSection.tsx
'use client'; // Nadal potrzebne, jeśli np. używasz Link lub planujesz interakcje

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Jeśli chcesz używać next/image

// Usunięto: useEffect, useRef, declare var Swiper

interface Offer {
  img: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  offerLink?: string;
}
interface OffersSectionProps {
  offers: Offer[];
}

const OffersSection: React.FC<OffersSectionProps> = ({ offers }) => {
  // Usunięto: logikę Swipera (useEffect, useRef)

  return (
    <div id="offers" className="cards-2">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title">OFERTA</div>
            <h2>Sprzęt, który oferujemy:</h2>
          </div>
        </div>
        <div className="row">
          {/* Ten div będzie teraz kontenerem flex dzięki Tailwind */}
          {/* Upewnij się, że Tailwind jest skonfigurowany poprawnie! */}
          <div className="col-lg-12 text-center">
            {/* Mapowanie ofert bezpośrednio w kontenerze flex */}
            {offers.map((offer, index) => (
              // Usunięto 'swiper-slide', możesz dodać klasy dla szerokości karty np. max-w-sm
              <div key={index} className="card max-w-sm m-5"> {/* Przykład: dodano max-w-sm */}
                {/* Struktura karty bez zmian */}
                <div className="card-image">
                  {/* Użyj img lub Image */}
                   <img className="imgFluid" src={offer.img} alt={offer.title} />
                  {/* <Image className="imgFluid" src={offer.img} alt={offer.title} width={400} height={300} style={{ width: '100%', height: 'auto' }} /> */}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{offer.title}</h3>
                  <p>{offer.description}</p>
                  <ul className="list-unstyled li-space-lg">
                    {offer.features.map((feature, fIndex) => (
                      <li key={fIndex} className="media">
                        <i className="fas fa-square"></i> {/* Upewnij się, że Font Awesome Solid działa */}
                        <div className="media-body">{feature}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="button-container">
                  <p className="price">
                    Już od <span>{offer.price}</span>
                  </p>
                  <Link href={`/oferta1`} className="btn-solid-reg page-scroll mr-2">
                    SPRAWDŹ OFERTĘ
                  </Link>
                  <a href="#reservation" className="btn-solid-reg page-scroll reservation-btn">
                    ZAREZERWUJ
                  </a>
                </div>
              </div>
            ))}
          </div> {/* end of col / flex container */}
        </div> {/* end of row */}
      </div> {/* end of container */}
    </div>
  );
};

export default OffersSection;