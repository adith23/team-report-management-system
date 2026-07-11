// Login Page — Sign-in route endpoint

import { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Team Reports account",
};

export default function LoginPage() {
  return <LoginForm />;
}
