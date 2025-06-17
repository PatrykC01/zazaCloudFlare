// scripts/hash-password.js LUB scripts/hash-password.mjs
import * as bcrypt from 'bcryptjs';// Zmień require na import

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

// scripts/generate-new-hash.mjs
// import { exportJWK, generateSecret } from 'jose';

// async function generate() {
//   // To jest twoje hasło
//   const password = 'w+uuz/#)nIz7LS5<&Ef6';
  
//   // To jest "sól", która powinna być unikalna dla każdego hasła
//   // W tym przypadku jest stała, bo masz jednego admina
//   const salt = new TextEncoder().encode('zaza-cloud-flare-salt');

//   const secret = await generateSecret('HS256');
//   const keyLike = await exportJWK(secret);
  
//   // To jest twój nowy HASH - skopiuj go
//   console.log("Nowy hash (zapisz w .env):", keyLike.k); 
// }

// generate();