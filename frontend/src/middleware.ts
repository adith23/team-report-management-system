// Next.js Edge Middleware — Route protection via cookie-based auth check
//
// This middleware runs at the edge (before rendering) and checks for the
// presence of the `access_token` HttpOnly cookie.
//
// LIMITATION: Edge Middleware cannot decode/verify the JWT (no access to
// JWT_SECRET_KEY at the edge). It only checks cookie *existence*. Full JWT
// validation + role checks happen server-side via the `/auth/me` endpoint,
// consumed by the `useCurrentUser` hook and `AuthGuard` component.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes accessible without authentication */
const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // If user already has a token, redirect away from auth pages
    if (token) {
      return NextResponse.redirect(new URL("/reports", request.url));
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/reports", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, Next.js internals, and API routes
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
