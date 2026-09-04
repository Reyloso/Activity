import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    isAdminRoute ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/activities") ||
    pathname.startsWith("/my-activities") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/didacticas");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isProtectedRoute && req.auth?.user.blocked) {
    return NextResponse.redirect(new URL("/login?blocked=1", req.nextUrl));
  }

  if (isAdminRoute && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/home/:path*",
    "/activities/:path*",
    "/my-activities/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/didacticas/:path*",
  ],
};
