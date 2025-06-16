document.addEventListener("DOMContentLoaded", () => {
  const formSelect = document.querySelector("#formSelect");

  // Event listener dla dynamicznie generowanych przycisków "ZAREZERWUJ"
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reservationOffer")) {
      event.preventDefault();

      const offerTitle = event.target
        .closest(".card")
        .querySelector(".card-title").textContent;

      // Znajdź odpowiedni indeks dla "formSelect" na podstawie tytułu oferty
      const options = formSelect.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].text === offerTitle) {
          formSelect.selectedIndex = i;
          break;
        }
      }

      // Przewiń do formularza
      document
        .querySelector("#reservation")
        .scrollIntoView({ behavior: "smooth" });
    }
  });
});
