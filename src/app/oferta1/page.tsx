'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function Oferta() {
  const [data, setData] = useState({
    Map: '',
    NaDobyBezPaliwa: '',
    NaDobyZPaliwem: '',
    PrzejazdSkuterem: '',
    PrzejazdPontonem: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchData();
  }, []);

 const parsePrices = (priceString: string | undefined | null) => {
  if (!priceString) return [];
  return priceString.split(',');
};
  const naDobyBezPaliwaPrices = parsePrices(data.NaDobyBezPaliwa);
  const naDobyZPaliwemPrices = parsePrices(data.NaDobyZPaliwem);
  const przejazdSkuteremPrices = parsePrices(data.PrzejazdSkuterem);

  return (
    <div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-md navbar-dark navbar-custom fixed-top">
        <Link className="navbar-brand logo-image" href="/">
          <img src="/images/logo.png" alt="alternative" />
          <p className="brandName" style={{ marginBottom: 0, color: 'white' }}>
            Zaza__Waters
          </p>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExampleDefault"
          aria-controls="navbarsExampleDefault"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-awesome fas fa-bars"></span>
          <span className="navbar-toggler-awesome fas fa-times"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarsExampleDefault">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/">
                HOME <span className="sr-only">(current)</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/#intro">
                O NAS
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/#offers">
                OFERTA
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/#reservation">
                ZAREZERWUJ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/#gallery">
                GALERIA
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link page-scroll" href="/#contact">
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
              <a href="https://www.instagram.com/zaza_waters/">
                <span className="hexagon"></span>
                <i className="fab fa-instagram fa-stack-1x"></i>
              </a>
            </span>
          </span>
        </div>
      </nav>

      {/* Header */}
      <header id="header" className="ex-header">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1>Nasza Oferta</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="ex-basic-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* end of breadcrumbs */}
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <h1 className="text-center mb-5">Wynajem skutera wodnego</h1>
        <div className="row my-5">
          <div className="col-md-6 text-center my-auto">
            <h2 className="oferta">Model: Sea Doo Spark Trixx 3up</h2>
            <p>Rocznik: 2024</p>
            <p>Liczba osób: 3</p>
            <p>Moc: 90 KM</p>
            <p>
              Idealny dla osób, które nigdy nie miały skutera i chciałyby zacząć
              swoją przygodę.
            </p>
          </div>
          <div className="col-md-6 text-center">
            <div className="image-container">
              <img
                className="img-fluid"
                src="/zazaimages/IMG_2362.jpg"
                style={{ borderRadius: '5px', aspectRatio: '1/1', width: '85%' }}
                alt="alternative"
              />
            </div>
          </div>
        </div>

        <div className="row my-5">
          <div className="col-md-6">
            <h2 className="oferta">Cennik - Wynajem na doby (bez paliwa)</h2>
            <table id="NaDobyBezPaliwa" className="table table-striped">
              <thead>
                <tr>
                  <th>Okres wynajmu</th>
                  <th>Cena</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0,5 dnia (6 godzin)</td>
                  <td>{naDobyBezPaliwaPrices[0] || ''}</td>
                </tr>
                <tr>
                  <td>1 doba</td>
                  <td>{naDobyBezPaliwaPrices[1] || ''}</td>
                </tr>
                <tr>
                  <td>2 dni</td>
                  <td>{naDobyBezPaliwaPrices[2] || ''}</td>
                </tr>
                <tr>
                  <td>3 dni</td>
                  <td>{naDobyBezPaliwaPrices[3] || ''}</td>
                </tr>
                <tr>
                  <td>Dłuższy okres</td>
                  <td>{naDobyBezPaliwaPrices[4] || ''}</td>
                </tr>
              </tbody>
            </table>
            <p>Cena dodatków również do ustalenia. Podane ceny do negocjacji.</p>
          </div>
          <div className="col-md-6">
            <h2 className="oferta">Motogodziny i kaucja</h2>
            <p>
              Przy wynajmie na doby ilość motogodzin (mth) wynosi 3 na dobę (5-6
              godzin mocnej zabawy)
            </p>
            <p>Każda rozpoczęta motogodzina: 250 zł</p>
            <p>Przy wynajmie na doby obowiązuje kaucja: 2000 zł</p>
          </div>
        </div>

        <div className="row my-5">
          <div className="col-md-6">
            <h3 className="oferta">Wynajem na doby</h3>
            <h4 className="oferta">Poniedziałek - Piątek:</h4>
            <table id="NaDobyZPaliwem" className="table table-striped">
              <thead>
                <tr>
                  <th>Czas wynajmu</th>
                  <th>Cena</th>
                  <th>Limit mth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3 godziny</td>
                  <td>{naDobyZPaliwemPrices[0] || ''}</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>6 godzin</td>
                  <td>{naDobyZPaliwemPrices[1] || ''}</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>12 godzin</td>
                  <td>{naDobyZPaliwemPrices[2] || ''}</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>

            <h4 className="oferta">Sobota - Niedziela:</h4>
            <table id="NaDobyZPaliwem2" className="table table-striped">
              <thead>
                <tr>
                  <th>Czas wynajmu</th>
                  <th>Cena</th>
                  <th>Limit mth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3 godziny</td>
                  <td>{naDobyZPaliwemPrices[3] || ''}</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>6 godzin</td>
                  <td>{naDobyZPaliwemPrices[4] || ''}</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>12 godzin</td>
                  <td>{naDobyZPaliwemPrices[5] || ''}</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
            <p>
              Każda następna rozpoczęta mth: 150 zł dopłaty. Cena wynajmu bez
              paliwa. Możliwość przywiezienia skutera w umówione miejsce za
              dodatkową opłatą, kwota do ustalenia.
            </p>
          </div>

          <div className="col-md-6">
            <h2 className="oferta">Wyposażenie</h2>
            <h4 className="oferta">Do skutera pełne wyposażenie:</h4>
            <p>przyczepka (przy wynajmie na całą dobę)</p>
            <p>kamizelki ratunkowe (różne rozmiary)</p>
            <p>bojka do kotwiczenia</p>
            <h4 className="oferta">Dodatkowo możliwość wynajmu wraz ze skuterem:</h4>
            <p>kanapa do holowania dwóch osób</p>
            <p>
              lodówka z wkładami chłodzącymi oraz uzupełniona napojami (do
              ustalenia)
            </p>
            <p>stoliczek kempingowy</p>
            <p>parawan</p>
            <p>karnister (również możliwość przywozu już pełnego)</p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-md-6">
            <h2 className="oferta">Cennik wynajmu - Łąka/Pogoria IV</h2>
            <h3 className="oferta">Wynajem skutera (w cenę wliczone paliwo)</h3>
            <table id="PrzejazdSkuterem" className="table table-striped">
              <thead>
                <tr>
                  <th>Czas wynajmu</th>
                  <th>Cena</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10 minut</td>
                  <td>{przejazdSkuteremPrices[0] || ''}</td>
                </tr>
                <tr>
                  <td>30 minut</td>
                  <td>{przejazdSkuteremPrices[1] || ''}</td>
                </tr>
                <tr>
                  <td>1 godzina</td>
                  <td>{przejazdSkuteremPrices[2] || ''}</td>
                </tr>
              </tbody>
            </table>
            <div id="ponton"></div>
            <h3 className="oferta">Przejazd pontonem za skuterem</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Usługa</th>
                  <th>Cena</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 przejazd (10 minut)</td>
                  <td id="PrzejazdPontonem">{data.PrzejazdPontonem || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-6">
            <h2 className="oferta">Aktualnie znajdujemy się:</h2>
            <iframe
              id="Map"
              src={data.Map}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="text-center my-5">
          <Link className="btn-solid-reg page-scroll" href="/#reservation">
            ZAREZERWUJ TERAZ
          </Link>
        </div>
      </div>

      <div className="footer"></div>

      <div id="contact" className="form-2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-container2">
                <div className="footer-dane">
                  <div
                    className="section-title"
                    style={{ marginBottom: '2.5rem', lineHeight: '2rem' }}
                  >
                    Skontaktuj się z nami
                  </div>
                  <p>
                    Jesteśmy dostępni telefonicznie, mailowo oraz w naszych
                    mediach społecznościowych
                  </p>
                  <ul className="list-unstyled li-space-lg">
                    <li className="address">
                      <i className="fas fa-map-marker-alt"></i>Piłsudskiego 44,
                      Łodygowice, Poland
                    </li>
                    <li>
                      <i className="fas fa-phone"></i>
                      <a href="tel:003024630820">+48 515 339 639</a>
                    </li>
                    <li>
                      <i className="fas fa-envelope"></i>
                      <a href="mailto:office@aria.com">
                        zazawaters.kontakt@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h3 style={{ textAlign: 'center' }}>
                    Śledź nas w naszych mediach społecznościowych
                  </h3>
                  <div
                    className="socials"
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <span className="fa-stack">
                      <a href="https://www.facebook.com/profile.php?id=61561476101080">
                        <span className="hexagon"></span>
                        <i className="fab fa-facebook-f fa-stack-1x"></i>
                      </a>
                    </span>

                    <span className="fa-stack">
                      <a href="https://www.instagram.com/zaza_waters/">
                        <span className="hexagon"></span>
                        <i className="fab fa-instagram fa-stack-1x"></i>
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* end of col */}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p className="p-small">
                © Copy Rights 2024 All Rights Reserved by Zaza__Waters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts */}
      {/* You'll need to find React-compatible versions or alternatives to these scripts,
           or potentially remove them and refactor the functionality into React components. */}
    </div>
  );
}