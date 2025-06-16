// src/components/Footer.tsx
import React from "react";

// Możesz dodać propsy, jeśli potrzebujesz dynamicznych danych w stopce,
// chociaż w Twoim HTML dane kontaktowe były w sekcji Contact,
// a stopka zawierała głównie Copyright. Jeśli dane z ContactSection
// mają być też w Footer, dodaj propsy jak poniżej.
interface FooterProps {
  location: string;
  phone: string;
  email: string;
}

// Jeśli stopka jest tylko statyczna (tylko Copyright), nie potrzebujesz propsów:
// const Footer = () => {
// Jeśli potrzebujesz propsów:
const Footer: React.FC<FooterProps> = ({ location, phone, email }) => {
  return (
    <>
      {/* Jeśli chcesz powtórzyć część informacyjną z ContactSection, wklej ją tutaj */}
      {/* <div className="footer"> */}
      {/* Możesz tu dodać kontener, jeśli potrzebujesz tła lub innego stylu dla sekcji informacyjnej */}
      {/* np. <div className="container"><div className="row">... info ...</div></div> */}
      {/* </div> */}

      {/* Copyright Section */}
      <div className="copyright">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p className="p-small">
                © Copy Rights 2025 All Rights Reserved by Zaza__Waters.
              </p>
            </div>
            {/* end of col */}
          </div>
          {/* end of row */}
        </div>
        {/* end of container */}
      </div>
      {/* end of copyright */}
    </>
  );
};

export default Footer;
