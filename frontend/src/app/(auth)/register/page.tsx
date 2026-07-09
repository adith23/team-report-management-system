// ──────────────────────────────────────────────────────────────────────────────
// Register Page — User registration route endpoint
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Register a new account on Team Reports",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
