// src/components/Navbar.tsx
import React from "react";
import Link from "next/link"; // Użyj Link z Next.js dla nawigacji
import Image from "next/image"; // Użyj Image z Next.js dla optymalizacji obrazków

const Navbar = () => {
  // ... skopiowany i przekonwertowany HTML/JSX dla Navbara ...
  // Pamiętaj o zamianie <a href="..."> na <Link href="..."> dla linków wewnętrznych
  // i <img> na <Image src="..." width={...} height={...} alt="..." />

  return (
    <nav className="navbar navbar-expand-md navbar-dark navbar-custom fixed-top">
      {/* Image Logo */}
      <Link href="/" className="navbar-brand logo-image">
        {/* Użyj next/image dla logo */}
        <Image
          src="/images/logo.png"
          alt="Zaza__Waters Logo"
          width={50}
          height={50}
        />{" "}
        {/* Dostosuj wymiary */}
        <p
          className="brandName"
          style={{
            marginBottom: 0,
            color: "white",
            display: "inline",
            marginLeft: "10px",
          }}
        >
          Zaza__Waters
        </p>
      </Link>

      {/* Mobile Menu Toggle Button */}
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse" // Te atrybuty (data-*) są dla Bootstrap JS
        data-target="#navbarsExampleDefault"
        aria-controls="navbarsExampleDefault"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-awesome fas fa-bars"></span>
        <span className="navbar-toggler-awesome fas fa-times"></span>
      </button>
      {/* end of mobile menu toggle button */}

      <div className="collapse navbar-collapse" id="navbarsExampleDefault">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            {/* Użyj Link dla page scroll lub zwykłe <a> jeśli Bootstrap JS to obsłuży */}
            <Link className="nav-link page-scroll" href="#header">
              HOME
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link page-scroll" href="#intro">
              O NAS
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link page-scroll" href="#offers">
              OFERTA
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link page-scroll" href="#reservation">
              ZAREZERWUJ
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link page-scroll" href="#gallery">
              GALERIA
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link page-scroll" href="#contact">
              KONTAKT
            </Link>
          </li>
        </ul>
        <span className="nav-item social-icons">
          <span className="fa-stack">
            <a href="https://www.facebook.com/profile.php?id=61561476101080">
              <span className="hexagon"></span>
              <i className="fab fa-facebook-f fa-stack-1x"></i>
            </a>
          </span>
          <span className="fa-stack">
            <a href="https://www.instagram.com/zaza_adventure">
              <span className="hexagon"></span>
              <i className="fab fa-instagram fa-stack-1x"></i>
            </a>
          </span>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
