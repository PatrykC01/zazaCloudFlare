// src/components/GallerySection.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image"; // Import Image

// Assume Isotope and jQuery/Magnific Popup types might not be available
declare var Isotope: any;
declare var $: any; // If using jQuery

interface GallerySectionProps {
  images: string[];
  videos: string[];
}

const GallerySection: React.FC<GallerySectionProps> = ({
  images = [],
  videos = [],
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isotopeInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false); // Track initialization
  const [activeFilter, setActiveFilter] = useState<string>("*");
  const [librariesLoaded, setLibrariesLoaded] = useState<boolean>(false); // Track library loading

  // --- Check for Libraries ---
  useEffect(() => {
    // Check periodically if libraries are loaded
    const checkLibs = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).Isotope &&
        (window as any).$ &&
        (window as any).$.fn.magnificPopup
      ) {
        setLibrariesLoaded(true);
      } else {
        // Retry check after a short delay
        setTimeout(checkLibs, 300);
      }
    };
    checkLibs();
  }, []); // Run only once on mount

  // --- Effect for INITIALIZATION (Isotope & Magnific Popup) ---
  // Runs when libraries are loaded OR when images/videos data changes
  useEffect(() => {
    if (!librariesLoaded || !gridRef.current) {
      console.log(
        "Initialization effect skipped: Libraries not loaded or gridRef not ready."
      );
      return; // Exit if libraries aren't loaded or ref isn't set
    }

    console.log("Initialization effect running...");
    const $ = (window as any).$;
    const Isotope = (window as any).Isotope;

    // --- Isotope Initialization ---
    if (!isotopeInstanceRef.current) {
      console.log("Initializing Isotope instance...");
      isotopeInstanceRef.current = new Isotope(gridRef.current, {
        itemSelector: ".element-item",
        layoutMode: "fitRows",
        // Animation options can be set here, but CSS is often preferred
        // transitionDuration: '0.4s',
        // hiddenStyle: { opacity: 0, transform: 'scale(0.95)' },
        // visibleStyle: { opacity: 1, transform: 'scale(1)' },
      });
      isInitializedRef.current = true;
    } else {
      console.log("Isotope already initialized, reloading items...");
      // If instance exists but data changed, reload items and layout
      isotopeInstanceRef.current.reloadItems();
      // We apply the filter in the *other* effect, but need to layout initially
      isotopeInstanceRef.current.arrange({ filter: activeFilter });
    }

    // --- Magnific Popup Initialization ---
    console.log("Initializing Magnific Popup...");
    // Destroy previous instance first to avoid conflicts if data reloads
    $(gridRef.current).magnificPopup("destroy");
    $(gridRef.current).magnificPopup({
      delegate: "a.popup-with-move-anim",
      type: "inline",
      fixedContentPos: false,
      fixedBgPos: true,
      overflowY: "auto",
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: "my-mfp-slide-bottom",
      callbacks: {
        open: function () {
          // Using 'any' as 'this' context from Magnific Popup isn't easily typed
          const itemSrc = $((this as any).currItem.el[0]).attr("href");
          if (itemSrc) {
            const content = $(itemSrc);
            const video = content.find("video");
            // Optional: attempt to play video (may be blocked by browser)
            // if (video.length) video[0].play().catch(e => console.error("Video autoplay failed:", e));
          }
        },
        close: function () {
          const itemSrc = $((this as any).currItem.el[0]).attr("href");
          if (itemSrc) {
            const content = $(itemSrc);
            const video = content.find("video");
            if (video.length) {
              (video[0] as HTMLVideoElement).pause();
              (video[0] as HTMLVideoElement).currentTime = 0;
            }
          }
        },
      },
    });

    // --- Cleanup Function ---
    return () => {
      console.log("Cleaning up Isotope and Magnific Popup...");
      if (isotopeInstanceRef.current) {
        // Check if destroy method exists before calling
        if (typeof isotopeInstanceRef.current.destroy === "function") {
          isotopeInstanceRef.current.destroy();
        }
        isotopeInstanceRef.current = null;
      }
      if ($ && gridRef.current && $.fn.magnificPopup) {
        // Check if magnificPopup method exists
        if (typeof $(gridRef.current).magnificPopup === "function") {
          $(gridRef.current).magnificPopup("destroy");
        }
      }
      isInitializedRef.current = false; // Reset initialization flag
    };
    // Dependencies: Run when libraries are confirmed loaded or data changes
  }, [librariesLoaded, images, videos, activeFilter]); // Include activeFilter here to ensure initial layout is correct

  // --- Effect for FILTERING ---
  // Runs only when activeFilter changes *after* initialization
  useEffect(() => {
    if (isotopeInstanceRef.current && isInitializedRef.current) {
      console.log(`Filtering Isotope with: ${activeFilter}`);
      isotopeInstanceRef.current.arrange({ filter: activeFilter });
    }
    // No cleanup needed here, main cleanup handles instance destruction
  }, [activeFilter]); // Dependency ONLY on activeFilter

  // Handler function for changing the filter
  const handleFilterChange = useCallback((filterValue: string) => {
    setActiveFilter(filterValue);
  }, []); // useCallback ensures the function identity is stable

  // --- Render JSX ---
  return (
    <div id="gallery" className="filter">
      <div className="container">
        {/* Section Title */}
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title">GALERIA</div>
          </div>
        </div>
        {/* Filter Buttons and Grid */}
        <div className="row">
          <div className="col-lg-12">
            {/* Filter Buttons */}
            <div className="button-group filters-button-group">
              {/* Use button element for better accessibility and semantics */}
              <a
                // Combine base classes with conditional active/inactive classes
                className={`border-2 rounded-md p-2 m-2 button transition-colors duration-300 ease-in-out ${
                  activeFilter === "*"
                    ? "bg-cyan-800 border-cyan-800 text-amber-50 is-checked" // Active style
                    : "bg-transparent border-cyan-800 text-cyan-800" // Inactive style
                }`}
                onClick={() => handleFilterChange("*")}
              >
                WSZYSTKO
              </a>
              <a
                className={`border-2 rounded-md p-2 m-2 button transition-colors duration-300 ease-in-out ${
                  activeFilter === ".pics"
                    ? "bg-cyan-800 border-cyan-800 text-amber-50 is-checked"
                    : "bg-transparent border-cyan-800 text-cyan-800"
                }`}
                onClick={() => handleFilterChange(".pics")}
              >
                ZDJĘCIA
              </a>
              <a
                className={`border-2 rounded-md p-2 m-2 button transition-colors duration-300 ease-in-out ${
                  activeFilter === ".vids"
                    ? "bg-cyan-800 border-cyan-800 text-amber-50 is-checked"
                    : "bg-transparent border-cyan-800 text-cyan-800"
                }`}
                onClick={() => handleFilterChange(".vids")}
              >
                WIDEO
              </a>
            </div>
            {/* Isotope Grid Container */}
            <div ref={gridRef} id="GalleryContainer" className="grid">
              {/* Render Images */}
              {images.map((src, index) => {
                const imgId = `el-${index + 1}`;
                return (
                  <div key={`img-${index}`} className="element-item pics">
                    <a className="popup-with-move-anim" href={`#${imgId}`}>
                      <div className="element-item-overlay"></div>
                      {/* Using standard img for simplicity with Isotope/Magnific */}
                      <img
                        src={src}
                        alt={`Galeria - Zdjęcie ${index + 1}`}
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          height: "auto",
                        }} // display:block helps prevent extra space
                        loading="lazy" // Add lazy loading
                      />
                    </a>
                  </div>
                );
              })}

              {/* Render Videos */}
              {videos.map((src, index) => {
                const videoId = `elV-${index + 1}`;
                return (
                  <div key={`vid-${index}`} className="element-item vids">
                    <a className="popup-with-move-anim" href={`#${videoId}`}>
                      <div className="element-item-overlay"></div>
                      {/* Thumbnail video */}
                      <video
                        muted // Muted is often required for any kind of autoplay/looping
                        loop
                        playsInline // Important for mobile
                        preload="metadata" // Load only metadata initially
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          height: "auto",
                        }}
                      >
                        <source src={src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </a>
                  </div>
                );
              })}
            </div>{" "}
            {/* end of grid */}
          </div>{" "}
          {/* end of col */}
        </div>{" "}
        {/* end of row */}
      </div>{" "}
      {/* end of container */}
      {/* Lightbox Container (Hidden) */}
      <div id="lightboxesContainer" style={{ display: "none" }}>
        {/* Image Lightboxes */}
        {images.map((src, index) => {
          const imgId = `el-${index + 1}`;
          return (
            <div
              key={`lightbox-img-${index}`}
              id={imgId}
              className="lightbox-basic zoom-anim-dialog mfp-hide my-auto"
            >
              <div className="row">
                <div className="col-12 mx-auto">
                  <Image
                    className="img-fluid"
                    src={src}
                    alt={`Galeria - Zdjęcie ${index + 1} Lightbox`}
                    width={600}
                    height={400}
                    quality={75}
                    loading="lazy"
                    style={{ height: "auto" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {/* Video Lightboxes */}
        {videos.map((src, index) => {
          const videoId = `elV-${index + 1}`;
          // Wyciągnij nazwę pliku bez rozszerzenia do miniatury
          const fileName =
            src.split("/").pop()?.split(".")[0] || `vid${index + 1}`;
          const poster = `/zazaimages/thumbs/${fileName}.jpg`;
          return (
            <div
              key={`lightbox-vid-${index}`}
              id={videoId}
              className="lightbox-basic zoom-anim-dialog mfp-hide my-auto"
            >
              <div className="row">
                <div className="col-12 mx-auto">
                  <video
                    controls
                    width="100%"
                    style={{ maxHeight: "80vh" }}
                    preload="none"
                    poster={poster}
                  >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          );
        })}
      </div>{" "}
      {/* end of lightboxesContainer */}
    </div> /* end of filter */
  );
};

export default GallerySection;
