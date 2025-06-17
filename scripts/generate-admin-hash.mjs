import { hashPassword } from "../src/lib/crypto.ts";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function generateHash() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("Enter the admin password (input will be hidden):");
    const password = await rl.question("Password: ", { hideInput: true });

    const { salt, hash } = await hashPassword(password);

    console.log("\nAdd this to your .env.local file:");
    console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
}

generateHash();
