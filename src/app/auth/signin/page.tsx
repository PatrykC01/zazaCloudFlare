"use client";

import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="container form-1">
      <h2>Panel Administratora</h2>
      <Suspense fallback={<div>Ładowanie formularza logowania...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
