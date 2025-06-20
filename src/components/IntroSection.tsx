// Plik: src/components/IntroSection.tsx

import React from 'react';

// 1. Zdefiniuj interfejs dla przyjmowanych właściwości (props)
interface IntroSectionProps {
  text: string;
  imageUrl: string;
}

// 2. Użyj zdefiniowanego interfejsu w komponencie
const IntroSection: React.FC<IntroSectionProps> = ({ text, imageUrl }) => {
  return (
    <div id="intro" className="basic-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="text-container">
              <div className="section-title">O NAS</div>
              {/* 3. Użyj propsów bezpośrednio w JSX */}
              <p>{text || 'Brak treści AboutP'}</p>
             
            </div>
          </div>
          <div className="col-lg-7">
            <div className="image-container">
              {/* 4. Użyj propsów bezpośrednio w JSX */}
              <img className="img-fluid" src={imageUrl || 'images/intro-office.jpg'} alt="O nas" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSection;