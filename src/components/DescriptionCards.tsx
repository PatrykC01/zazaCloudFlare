// src/components/DescriptionCards.tsx
import React from 'react';

const DescriptionCards = () => {
  return (
    <div className="cards-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {/* Card 1 */}
            <div className="card">
              <span className="fa-stack">
                <span className="hexagon"></span>
                <i className="fas fa-suitcase fa-stack-1x"></i>
              </span>
              <div className="card-body">
                <h4 className="card-title">Profesjonalizm</h4>
                <p>
                Nasz zespół składa się z wykwalifikowanych specjalistów, którzy służą pomocą i doradztwem na każdym etapie wynajmu.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="card">
              <span className="fa-stack">
                <span className="hexagon"></span>
                <i className="fas fa-user-shield fa-stack-1x"></i>
              </span>
              <div className="card-body">
                <h4 className="card-title">Bezpieczeństwo</h4>
                <p>
                Przykładamy ogromną wagę do bezpieczeństwa naszych klientów. Wszystkie nasze skutery są regularnie kontrolowane, a każdy klient otrzymuje szczegółowe instrukcje dotyczące obsługi oraz środków bezpieczeństwa.

                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="card">
              <span className="fa-stack">
                <span className="hexagon"></span>
                <i className="fas fa-calendar-check fa-stack-1x"></i>
              </span>
              <div className="card-body">
                <h4 className="card-title">Elastyczność</h4>
                <p>
                Oferujemy elastyczne godziny wynajmu oraz atrakcyjne pakiety cenowe, dostosowane do indywidualnych potrzeb naszych klientów.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionCards;