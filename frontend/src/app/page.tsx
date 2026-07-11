// Root Page — Redirects to /reports or /login via middleware
//
// This page is a fallback. The Edge Middleware handles root path redirects,
// but this ensures a valid component exists for the `/` route.

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
