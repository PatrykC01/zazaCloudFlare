// app/cms/CmsClient.tsx
"use client";

import React, { useState, useTransition, useRef, FormEvent } from "react";
import { CmsContentData } from "../(pages)/content/page"; // Import the data structure type
import { useRouter } from "next/navigation";
import type { Offer } from "@/types/offer";

// --- UI Components (Replace with your actual UI library like Shadcn/ui or use basic HTML) ---
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="border p-2 rounded w-full mb-2" />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="border p-2 rounded w-full mb-2" rows={4} />
);
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-4 py-2 rounded text-white ${
      props.disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
    } ${props.className}`}
  />
);
const DangerButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-3 py-1 rounded text-xs text-white DangerButton ${
      props.disabled ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
    } ${props.className}`}
  />
);
const SuccessButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => (
  <button
    {...props}
    className={`px-3 py-1 rounded text-xs text-white SuccessButton ${
      props.disabled ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
    } ${props.className}`}
  />
);
const EditButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-3 py-1 rounded text-xs text-white bg-yellow-500 hover:bg-yellow-600 EditButton ${props.className}`}
  >
    Edit
  </button>
);
const SaveButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-3 py-1 rounded text-xs text-white ${
      props.disabled ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
    } ${props.className}`}
  >
    Save
  </button>
);
const CancelButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-3 py-1 rounded text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 ${props.className}`}
  >
    Cancel
  </button>
);
// ---

interface CmsClientProps {
  initialContent: CmsContentData;
}

type EditModes = {
  [key: string]: boolean;
};

export default function CmsClient({ initialContent }: CmsClientProps) {
  console.log(
    "CmsClient - Received initialContent:",
    JSON.stringify(initialContent, null, 2)
  );
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<CmsContentData>(initialContent);
  const [editModes, setEditModes] = useState<EditModes>({});
  const formRefs = useRef<{ [key: string]: HTMLFormElement | null }>({}); // Refs for forms

  // --- Handlers ---
  const toggleEdit = (section: string) => {
    setEditModes((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ZAMIANA: fetch do /api/content zamiast server action
  const handleSimpleSubmit = async (
    tagName: string,
    value: string | null | undefined
  ) => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName, tagContent: value ?? "" }),
      });
      const result = await res.json();
      if (!result.success)
        alert(`Error updating ${tagName}: ${result.message || "Unknown error"}`);
      else {
        setContent((prev) => ({ ...prev, [tagName]: value ?? "" }));
        toggleEdit(tagName);
        router.refresh();
      }
    } catch (e) {
      alert(`Error updating ${tagName}: ${e}`);
    }
  };

  // ZAMIANA: fetch do /api/content dla wielu pól
  const handleFormSubmit = async (
    sectionKey: string,
    event?: FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();
    const form = formRefs.current[sectionKey];
    if (!form) {
      console.error(`Form ref not found for section: ${sectionKey}`);
      alert("An error occurred submitting the form.");
      return;
    }
    const formData = new FormData(form);

    // Zbierz wszystkie pola do upsertu
    const updates: { tagName: string; tagContent: string }[] = [];
    for (const [key, value] of formData.entries()) {
      updates.push({ tagName: key, tagContent: String(value) });
    }

    try {
      // Wysyłaj każde pole osobno (możesz też zrobić batch, jeśli API obsługuje)
      for (const update of updates) {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message || "Unknown error");
      }
      // Sukces: zaktualizuj lokalny stan
      setContent((prev) => ({
        ...prev,
        ...Object.fromEntries(updates.map((u) => [u.tagName, u.tagContent])),
      }));
      if (editModes[sectionKey]) toggleEdit(sectionKey);
      alert(`Section ${sectionKey} saved successfully!`);
      router.refresh();
    } catch (e) {
      alert(`Error saving section ${sectionKey}: ${e}`);
    }
  };

  // Dodaj ofertę przez fetch do /api/offer
  const handleAddOffer = async (formData: FormData) => {
    try {
      const offer = Object.fromEntries(formData.entries());
      const res = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unknown error");
      alert("Oferta dodana!");
      router.refresh();
    } catch (e) {
      alert(`Błąd dodawania oferty: ${e}`);
    }
  };

  // Usuń ofertę przez fetch do /api/offer
  const handleDeleteOffer = async (title: string) => {
    if (!confirm(`Are you sure you want to delete the offer: ${title}?`)) return;
    try {
      const res = await fetch("/api/offer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unknown error");
      alert("Oferta usunięta!");
      router.refresh();
    } catch (e) {
      alert(`Błąd usuwania oferty: ${e}`);
    }
  };

  const handleDeleteMedia = async (type: "IMG" | "VID", path: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this ${
          type === "IMG" ? "image" : "video"
        }: ${path}?`
      )
      return;
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType: type, mediaPath: path }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unknown error");
      alert("Media usunięte!");
      router.refresh();
    } catch (e) {
      alert(`Błąd usuwania mediów: ${e}`);
    }
  };

  // Dodaj media przez fetch do /api/media
  const handleAddMedia = async (formData: FormData) => {
    try {
      const media = Object.fromEntries(formData.entries());
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(media),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unknown error");
      alert("Media dodane!");
      router.refresh();
    } catch (e) {
      alert(`Błąd dodawania mediów: ${e}`);
    }
  };

  // Helper to get current value for pricing fields, considering edit mode form data or fetched data
  const getPriceValue = (
    list: string[] | undefined,
    index: number,
    sectionKey: string
  ): string => {
    // In a real form scenario, you'd bind inputs to a state object updated onChange.
    // For simplicity here, we'll just show the initial data.
    // A better implementation would involve a state object for the form values.
    return list?.[index] ?? "";
  };

  // --- Render Section Helper ---
  const renderSection = (
    title: string,
    sectionKey: string,
    contentRenderer: () => React.ReactNode,
    formRenderer?: () => React.ReactNode, // Optional dedicated form renderer
    formAction: (
      formData: FormData
    ) => Promise<any> = async () => {} // nie używamy już server action
  ) => (
    <div className="border shadow-lg p-4 my-4 bg-gray-50 relative">
      <h2 className="text-xl font-semibold border-b mb-4 pb-2">{title}</h2>
      {editModes[sectionKey] && formRenderer ? (
        // Use dedicated form renderer if provided
        <form
          ref={(el) => {
            formRefs.current[sectionKey] = el;
          }}
          onSubmit={(e) => handleFormSubmit(sectionKey, e)}
        >
          {formRenderer()}
          <div className="flex justify-end space-x-2 mt-4 absolute top-2 right-2">
            <SaveButton type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </SaveButton>
            <CancelButton
              type="button"
              onClick={() => toggleEdit(sectionKey)}
              disabled={isPending}
            >
              Cancel
            </CancelButton>
          </div>
        </form>
      ) : editModes[sectionKey] && !formRenderer ? (
        // Fallback to using contentRenderer wrapped in a form (for simple single-field edits)
        // This might need adjustments based on how you structure simple edits
        <form
          ref={(el) => {
            formRefs.current[sectionKey] = el;
          }}
          onSubmit={(e) => handleFormSubmit(sectionKey, e)}
        >
          {contentRenderer()}{" "}
          {/* This assumes contentRenderer outputs form inputs in edit mode */}
          <div className="flex justify-end space-x-2 mt-4 absolute top-2 right-2">
            <SaveButton type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </SaveButton>
            <CancelButton
              type="button"
              onClick={() => toggleEdit(sectionKey)}
              disabled={isPending}
            >
              Cancel
            </CancelButton>
          </div>
        </form>
      ) : (
        // Display mode
        <>
          {contentRenderer()}
          {/* Show Edit button only if an edit mode exists for this section */}
          {(formRenderer ||
            sectionKey in initialContent ||
            ["Offers", "Gallery", "Pricing"].includes(sectionKey)) && (
            <EditButton
              onClick={() => toggleEdit(sectionKey)}
              className="absolute top-2 right-2"
            />
          )}
        </>
      )}
    </div>
  );

  // --- Render ---
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        CMS - Zarządzanie Treścią Strony
      </h1>
      {/* --- Banner Section --- */}
      {renderSection(
        "Baner",
        "HeaderIMG",
        () =>
          editModes.HeaderIMG ? (
            <Input
              name="HeaderIMG"
              defaultValue={content.HeaderIMG || ""}
              placeholder="Image URL/Path"
            />
          ) : (
            <img
              src={content.HeaderIMG || "/placeholder.jpg"}
              alt="Banner"
              className="cmsImg mw-75 mx-auto max-h-60 object-contain CmsBannerImg"
            />
          )
        // No dedicated form renderer needed here if using the default submit logic
      )}
      {/* --- About Section --- */}
      {renderSection(
        "O Nas",
        "About",
        // Content Renderer (tryb podglądu) - wyświetla dane
        () => (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <p className="text-gray-700 whitespace-pre-wrap">
                {content.AboutP || "Brak opisu."}
              </p>
            </div>
            <div className="md:w-1/2">
              {content.AboutIMG ? (
                <img src={content.AboutIMG} className="CmsAboutImg" />
              ) : (
                <p className="text-gray-500">Brak obrazka.</p>
              )}
            </div>
          </div>
        ),
        // Form Renderer (tryb edycji) - używa defaultValue
        () => (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <label htmlFor="AboutP">Tekst:</label>
              <Textarea
                id="AboutP"
                name="AboutP"
                // TUTAJ: Pobiera wartość z aktualnego stanu 'content' przy renderowaniu formularza
                defaultValue={content.AboutP || ""}
                placeholder="Opis 'O Nas'..."
              />
            </div>
            <div className="md:w-1/2">
              <label htmlFor="AboutIMG">URL Obrazka:</label>
              <Input
                id="AboutIMG"
                name="AboutIMG"
                // TUTAJ: Pobiera wartość z aktualnego stanu 'content' przy renderowaniu formularza
                defaultValue={content.AboutIMG || ""}
                placeholder="Image URL/Path"
              />
            </div>
          </div>
        )
      )}
      {/* --- Offers Section --- */}
      <div className="border shadow-lg p-4 my-4 bg-gray-50">
        <h2 className="text-xl font-semibold border-b mb-4 pb-2">Oferta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {(content.Offers || []).map((offer, index) => (
            <div key={index} className="border p-3 relative bg-white rounded">
              <img
                src={offer.img || "/placeholder.jpg"}
                alt={offer.title}
                className="w-full h-32 object-contain mb-2 CmsOfferImg"
              />
              <h4 className="font-semibold text-center mb-1">{offer.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
              {offer.features && offer.features.length > 0 && (
                <ul className="list-disc list-inside text-sm mb-2">
                  {offer.features.map((feat, fIndex) => (
                    <li key={fIndex}>{feat}</li>
                  ))}
                </ul>
              )}
              <p className="text-center font-medium text-green-700">
                Już od {offer.price}
              </p>
              <DangerButton
                onClick={() => handleDeleteOffer(offer.title)}
                className="absolute top-1 right-1 bg-red-300"
                disabled={isPending}
              >
                X
              </DangerButton>
            </div>
          ))}
        </div>
        {/* Add New Offer Form */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Dodaj Nową Ofertę</h3>
        <form
          ref={(el) => {
            formRefs.current["addOffer"] = el;
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = formRefs.current["addOffer"];
            if (!form) return;
            const formData = new FormData(form);
            await handleAddOffer(formData);
            form.reset();
          }}
          className="border p-4 bg-white rounded grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label>URL Obrazka:</label>
            <Input name="img" required />
          </div>
          <div>
            <label>Tytuł:</label>
            <Input name="title" required />
          </div>
          <div className="md:col-span-2">
            <label>Opis:</label>
            <Textarea name="description" required />
          </div>
          <div>
            <label>Cechy (oddzielone przecinkami):</label>
            <Input name="features" />
          </div>
          <div>
            <label>Cena (np. 100 PLN):</label>
            <Input name="price" required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <SuccessButton type="submit" disabled={isPending}>
              {isPending ? "Dodawanie..." : "Dodaj Ofertę"}
            </SuccessButton>
          </div>
        </form>
      </div>
      {/* --- Map Section --- */}
      {renderSection("Mapa", "Map", () =>
        editModes.Map ? (
          <Input
            name="Map"
            defaultValue={content.Map || ""}
            placeholder="Google Maps Embed URL (iframe src)"
          />
        ) : content.Map ? (
          <iframe
            src={content.Map}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-2"
          ></iframe>
        ) : (
          <p className="text-gray-500">Mapa nie została skonfigurowana.</p>
        )
      )}
      {/* --- Gallery Section --- */}
      <div className="border shadow-lg p-4 my-4 bg-gray-50">
        {" "}
        {/* Początek JEDYNEJ sekcji Galerii */}
        <h2 className="text-xl font-semibold border-b mb-4 pb-2">Galeria</h2>
        {/* Display Images */}
        <h3 className="text-lg font-semibold mb-2">Zdjęcia</h3>
        <div className="CmsgalleryContainer cms-gallery">
          {(content.GalleryImages || []).map((img, index) => (
            <div key={`img-${index}`} className="CmsgalleryImg">
              {" "}
              {/* Klasy w-24, h-24, relative są teraz w CSS */}
              <img
                src={img || "/placeholder.jpg"}
                alt={`Gallery Image ${index + 1}`}
                className="rounded" /* Klasy pozycjonowania, rozmiaru i object-fit są w CSS, zostawiamy tylko rounded */
              />
              <DangerButton
                onClick={() => handleDeleteMedia("IMG", img)}
                // Klasy pozycjonowania i z-index są w CSS, zostawiamy tylko wygląd
                className="px-3 py-1 text-xs ..." /* Itp. */
                disabled={isPending}
              >
                X
              </DangerButton>
            </div>
          ))}
        </div>
        {/* Display Videos */}
        <h3 className="text-lg font-semibold mb-2">Wideo</h3>
        <div className="CmsgalleryContainer cms-gallery">
          {(content.GalleryVideos || []).map((vid, index) => (
            <div key={`vid-${index}`} className="relative CmsgalleryVid">
              {" "}
              {/* Klasy w-24, h-24, relative są teraz w CSS */}
              <video
                controls
                src={vid}
                className="w-full h-32 object-cover rounded bg-black CmsgalleryVid"
              >
                Your browser does not support the video tag.
              </video>
              <DangerButton
                onClick={() => handleDeleteMedia("VID", vid)}
                // Pamiętaj, że dla Wideo przycisk jest w prawym rogu, zmień jeśli chcesz
                className="absolute top-1 right-1"
                disabled={isPending}
              >
                X
              </DangerButton>
            </div>
          ))}
          {(!content.GalleryVideos || content.GalleryVideos.length === 0) && (
            <p className="text-gray-500 col-span-full">Brak wideo w galerii.</p>
          )}
        </div>{" "}
        {/* Koniec siatki wideo */}
        {/* Add New Media Form */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Dodaj Media</h3>
        <form
          ref={(el) => {
            formRefs.current["addMedia"] = el;
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = formRefs.current["addMedia"];
            if (!form) return;
            const formData = new FormData(form);
            await handleAddMedia(formData);
            form.reset();
          }}
          className="border p-4 bg-white rounded flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-grow">
            <label>URL/Ścieżka Mediów:</label>
            <Input name="mediaPath" required />
          </div>
          <div>
            <label className="block mb-1">Typ:</label>
            <select name="mediaType" className="border p-2 rounded h-[42px]">
              <option value="IMG">Zdjęcie</option>
              <option value="VID">Wideo</option>
            </select>
          </div>
          <div>
            <SuccessButton
              type="submit"
              disabled={isPending}
              className="h-[42px]"
            >
              {isPending ? "Dodawanie..." : "Dodaj Media"}
            </SuccessButton>
          </div>
        </form>{" "}
        {/* Koniec formularza */}
      </div>{" "}
      {/* Koniec JEDYNEJ sekcji Galerii */}
      {/* --- Contact Section --- */}
      {renderSection(
        "Kontakt",
        "Contact",
        // Content Renderer (View Mode)
        () => (
          <div className="space-y-2 text-sm text-gray-700">
            {" "}
            {/* Dodano style dla tekstu */}
            <p>
              <span className="font-semibold">Adres:</span>{" "}
              {content.FooterLocation || "Nie podano"}
            </p>
            <p>
              <span className="font-semibold">Telefon:</span>{" "}
              {content.FooterPhone ? (
                <a
                  href={`tel:${content.FooterPhone.replace(/\s/g, "")}`}
                  className="text-blue-600 hover:underline"
                >
                  {content.FooterPhone}
                </a>
              ) : (
                "Nie podano"
              )}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {content.FooterEmail ? (
                <a
                  href={`mailto:${content.FooterEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {content.FooterEmail}
                </a>
              ) : (
                "Nie podano"
              )}
            </p>
          </div>
        ),
        // Form Renderer (Edit Mode) - pozostaje bez zmian
        () => (
          <div className="space-y-3">
            <div>
              <label htmlFor="FooterLocation">Adres:</label>
              <Input
                id="FooterLocation"
                name="FooterLocation" // Klucz z contentActions
                defaultValue={content.FooterLocation || ""}
                placeholder="np. ul. Przykładowa 1, 00-000 Miasto"
              />
            </div>
            <div>
              <label htmlFor="FooterPhone">Telefon:</label>
              <Input
                id="FooterPhone"
                name="FooterPhone" // Klucz z contentActions
                defaultValue={content.FooterPhone || ""}
                type="tel"
                placeholder="np. +48 123 456 789"
              />
            </div>
            <div>
              <label htmlFor="FooterEmail">Email:</label>
              <Input
                id="FooterEmail"
                name="FooterEmail" // Klucz z contentActions
                defaultValue={content.FooterEmail || ""}
                type="email"
                placeholder="np. kontakt@example.com"
              />
            </div>
          </div>
        )
      )}
      {/* --- Pricing Sections --- */}
      {/* 1. Cennik - Wynajem na doby (bez paliwa) */}
      {renderSection(
        "Cennik - Wynajem na doby (bez paliwa)",
        "PricingBezPaliwa",
        // Content Renderer (View Mode)
        () => (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold">
                  Okres wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Cena wynajmu
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">0,5 dnia (6 godzin)</td>
                <td className="border p-2">
                  {content.NaDobyBezPaliwa?.[0] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">1 doba</td>
                <td className="border p-2">
                  {content.NaDobyBezPaliwa?.[1] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">2 dni</td>
                <td className="border p-2">
                  {content.NaDobyBezPaliwa?.[2] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">3 dni</td>
                <td className="border p-2">
                  {content.NaDobyBezPaliwa?.[3] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Dłuższy okres</td>
                <td className="border p-2">
                  {content.NaDobyBezPaliwa?.[4] || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        ),
        // Form Renderer (Edit Mode)
        () => (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Okres wynajmu</th>
                <th className="border p-2 text-left">Cena wynajmu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">0,5 dnia (6 godzin)</td>
                <td className="border p-2">
                  <Input
                    name="CenaBezPaliwa1" // Klucz z contentActions
                    defaultValue={getPriceValue(
                      content.NaDobyBezPaliwa,
                      0,
                      "PricingBezPaliwa"
                    )}
                    placeholder="np. 500 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">1 doba</td>
                <td className="border p-2">
                  <Input
                    name="CenaBezPaliwa2"
                    defaultValue={getPriceValue(
                      content.NaDobyBezPaliwa,
                      1,
                      "PricingBezPaliwa"
                    )}
                    placeholder="np. 800 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">2 dni</td>
                <td className="border p-2">
                  <Input
                    name="CenaBezPaliwa3"
                    defaultValue={getPriceValue(
                      content.NaDobyBezPaliwa,
                      2,
                      "PricingBezPaliwa"
                    )}
                    placeholder="np. 1500 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">3 dni</td>
                <td className="border p-2">
                  <Input
                    name="CenaBezPaliwa4"
                    defaultValue={getPriceValue(
                      content.NaDobyBezPaliwa,
                      3,
                      "PricingBezPaliwa"
                    )}
                    placeholder="np. 2100 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Dłuższy okres</td>
                <td className="border p-2">
                  <Input
                    name="CenaBezPaliwa5"
                    defaultValue={getPriceValue(
                      content.NaDobyBezPaliwa,
                      4,
                      "PricingBezPaliwa"
                    )}
                    placeholder="Ustalane indywidualnie"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )
      )}
      {/* 2. Cennik - Wynajem na doby (z paliwem) Pn-Pt */}
      {renderSection(
        "Cennik - Wynajem na doby (z paliwem) Pn-Pt",
        "PricingZPaliwemPnPt",
        // Content Renderer (View Mode)
        () => (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold">
                  Okres wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Cena wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Limit mth
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">3 godziny</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[0] || "-"}
                </td>
                <td className="border p-2">1</td>
              </tr>
              <tr>
                <td className="border p-2">6 godzin</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[1] || "-"}
                </td>
                <td className="border p-2">2</td>
              </tr>
              <tr>
                <td className="border p-2">12 godzin</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[2] || "-"}
                </td>
                <td className="border p-2">3</td>
              </tr>
            </tbody>
          </table>
        ),
        // Form Renderer (Edit Mode)
        () => (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Okres wynajmu</th>
                <th className="border p-2 text-left">Cena wynajmu</th>
                <th className="border p-2 text-left">Limit mth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">3 godziny</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem1" // Klucz z contentActions
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      0,
                      "PricingZPaliwemPnPt"
                    )}
                    placeholder="np. 600 PLN"
                  />
                </td>
                <td className="border p-2">1</td>
              </tr>
              <tr>
                <td className="border p-2">6 godzin</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem2"
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      1,
                      "PricingZPaliwemPnPt"
                    )}
                    placeholder="np. 1000 PLN"
                  />
                </td>
                <td className="border p-2">2</td>
              </tr>
              <tr>
                <td className="border p-2">12 godzin</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem3"
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      2,
                      "PricingZPaliwemPnPt"
                    )}
                    placeholder="np. 1800 PLN"
                  />
                </td>
                <td className="border p-2">3</td>
              </tr>
            </tbody>
          </table>
        )
      )}
      {/* 3. Cennik - Wynajem na doby (z paliwem) Sb-Nd */}
      {renderSection(
        "Cennik - Wynajem na doby (z paliwem) Sb-Nd",
        "PricingZPaliwemSbNd",
        // Content Renderer (View Mode)
        () => (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold">
                  Okres wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Cena wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Limit mth
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">3 godziny</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[3] || "-"}
                </td>
                <td className="border p-2">1</td>
              </tr>
              <tr>
                <td className="border p-2">6 godzin</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[4] || "-"}
                </td>
                <td className="border p-2">2</td>
              </tr>
              <tr>
                <td className="border p-2">12 godzin</td>
                <td className="border p-2">
                  {content.NaDobyZPaliwem?.[5] || "-"}
                </td>
                <td className="border p-2">3</td>
              </tr>
            </tbody>
          </table>
        ),
        // Form Renderer (Edit Mode)
        () => (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Okres wynajmu</th>
                <th className="border p-2 text-left">Cena wynajmu</th>
                <th className="border p-2 text-left">Limit mth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">3 godziny</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem4" // Klucz z contentActions
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      3,
                      "PricingZPaliwemSbNd"
                    )}
                    placeholder="np. 700 PLN"
                  />
                </td>
                <td className="border p-2">1</td>
              </tr>
              <tr>
                <td className="border p-2">6 godzin</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem5"
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      4,
                      "PricingZPaliwemSbNd"
                    )}
                    placeholder="np. 1200 PLN"
                  />
                </td>
                <td className="border p-2">2</td>
              </tr>
              <tr>
                <td className="border p-2">12 godzin</td>
                <td className="border p-2">
                  <Input
                    name="CenaZPaliwem6"
                    defaultValue={getPriceValue(
                      content.NaDobyZPaliwem,
                      5,
                      "PricingZPaliwemSbNd"
                    )}
                    placeholder="np. 2000 PLN"
                  />
                </td>
                <td className="border p-2">3</td>
              </tr>
            </tbody>
          </table>
        )
      )}
      {/* 4. Cennik - Wynajem skutera (w cenie paliwo) */}
      {renderSection(
        "Cennik - Wynajem skutera (w cenie paliwo)",
        "PricingSkuter",
        // Content Renderer (View Mode)
        () => (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold">
                  Czas wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Cena wynajmu
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">10 minut</td>
                <td className="border p-2">
                  {content.PrzejazdSkuterem?.[0] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">30 minut</td>
                <td className="border p-2">
                  {content.PrzejazdSkuterem?.[1] || "-"}
                </td>
              </tr>
              <tr>
                <td className="border p-2">1 godzina</td>
                <td className="border p-2">
                  {content.PrzejazdSkuterem?.[2] || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        ),
        // Form Renderer (Edit Mode)
        () => (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Czas wynajmu</th>
                <th className="border p-2 text-left">Cena wynajmu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">10 minut</td>
                <td className="border p-2">
                  <Input
                    name="Skuter10min" // Klucz z contentActions
                    defaultValue={getPriceValue(
                      content.PrzejazdSkuterem,
                      0,
                      "PricingSkuter"
                    )}
                    placeholder="np. 100 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">30 minut</td>
                <td className="border p-2">
                  <Input
                    name="Skuter30min"
                    defaultValue={getPriceValue(
                      content.PrzejazdSkuterem,
                      1,
                      "PricingSkuter"
                    )}
                    placeholder="np. 250 PLN"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">1 godzina</td>
                <td className="border p-2">
                  <Input
                    name="Skuter60min"
                    defaultValue={getPriceValue(
                      content.PrzejazdSkuterem,
                      2,
                      "PricingSkuter"
                    )}
                    placeholder="np. 400 PLN"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )
      )}
      {/* 5. Cennik - Ponton */}
      {renderSection(
        "Cennik - Ponton",
        "PricingPonton",
        // Content Renderer (View Mode)
        () => (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold">
                  Czas wynajmu
                </th>
                <th className="border p-2 text-left font-semibold">
                  Cena wynajmu
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">1 przejazd (10 minut)</td>
                <td className="border p-2">
                  {content.PrzejazdPontonem || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        ),
        // Form Renderer (Edit Mode)
        () => (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Czas wynajmu</th>
                <th className="border p-2 text-left">Cena wynajmu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">1 przejazd (10 minut)</td>
                <td className="border p-2">
                  <Input
                    name="PrzejazdPontonem" // Klucz z contentActions
                    defaultValue={content.PrzejazdPontonem || ""}
                    placeholder="np. 50 PLN"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
