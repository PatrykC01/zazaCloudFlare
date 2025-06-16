// scripts/hash-password.js LUB scripts/hash-password.mjs
import bcrypt from "bcrypt"; // Zmień require na import

const saltRounds = 10;
const plainPassword = "w+uuz/#)nIz7LS5<&Ef6"; // Lub inne hasło, dla którego chcesz hash

// Użyjemy funkcji asynchronicznej, aby móc użyć await (czytelniejsze niż callback)
async function generateHash() {
  try {
    console.log(`Generowanie hasha dla hasła: "${plainPassword}"`);
    const hash = await bcrypt.hash(plainPassword, saltRounds); // Użyj await
    console.log("NOWY Hash (skopiuj BARDZO DOKŁADNIE):", hash);
  } catch (err) {
    console.error("Błąd podczas hashowania:", err);
  }
}

generateHash(); // Wywołaj funkcję
