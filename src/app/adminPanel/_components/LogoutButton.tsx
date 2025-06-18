// src/app/adminPanel/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <button onClick={handleLogout} style={{ marginTop: "20px" }}>
      Wyloguj się
    </button>
  );
}
