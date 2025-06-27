// src/components/ContactSection.tsx
import React from "react";

interface ContactSectionProps {
  location: string;
  phone: string;
  email: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  location,
  phone,
  email,
}) => {
  return (
    <div id="contact" className="form-2">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-container2">
              {" "}
              {/* Upewnij się, że ta klasa CSS istnieje i działa */}
              <div className="footer-dane">
                <div
                  className="section-title mt-5"
                  style={{ marginBottom: "2.5rem", lineHeight: "1.7rem" }}
                >
                  Skontaktuj się z nami
                </div>
                <p style={{color:"#fff"}}>
                  Jesteśmy dostępni telefonicznie, mailowo oraz w naszych
                  mediach społecznościowych
                </p>
                <ul className="list-unstyled li-space-lg">
                  <li className="address">
                    <i className="fas fa-map-marker-alt"></i>
                    <span id="FooterLocation" style={{color:"#fff"}}>{location}</span>
                  </li>
                  <li>
                    <i className="fas fa-phone"></i>
                    <a id="FooterPhone" style={{color:"#fff"}} href={`tel:${phone}`}>
                      {phone}
                    </a>
                  </li>
                  <li>
                    <i className="fas fa-envelope"></i>
                    <a id="FooterEmail" style={{color:"#fff"}} href={`mailto:${email}`}>
                      {email}
                    </a>
                  </li>
                </ul>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h3 style={{ textAlign: "center", color: "#fff" }}>
                  {" "}
                  {/* Upewnij się, że ten kolor pasuje */}
                  Śledź nas w naszych mediach społecznościowych
                </h3>
                <div
                  className="socials"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {" "}
                  {/* Dodano gap */}
                  <span className="fa-stack">
                    <a
                      href="https://www.facebook.com/profile.php?id=61561476101080"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      {/* Dodano target i rel */}
                      <span className="hexagon"></span>
                      <i className="fab fa-facebook-f fa-stack-1x"></i>
                    </a>
                  </span>
                  <span className="fa-stack">
                    <a
                      href="https://www.instagram.com/zaza_adventure/#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      {/* Dodano target i rel */}
                      <span className="hexagon"></span>
                      <i className="fab fa-instagram fa-stack-1x"></i>
                    </a>
                  </span>
                </div>
              </div>
            </div>
            {/* end of text-container2 */}
          </div>
          {/* end of col */}
        </div>
        {/* end of row */}
      </div>
      {/* end of container */}
    </div>
    /* end of form-2 */
  );
};

export default ContactSection;
