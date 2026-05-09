import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

  const isDashboardPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/clients") ||
    request.nextUrl.pathname.startsWith("/appointments") ||
    request.nextUrl.pathname.startsWith("/services") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/settings");

  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("supabase-auth-token"));

  if (isDashboardPage && !hasSupabaseCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/clients/:path*",
    "/appointments/:path*",
    "/services/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};