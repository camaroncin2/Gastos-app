import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPage = pathname === "/login" || pathname === "/auth";
  const isApiAuth = pathname.startsWith("/api/auth");

  // Always allow auth API routes
  if (isApiAuth) return NextResponse.next();

  // Always allow public static assets (PWA manifest, service worker, icons, fonts…)
  if (
    pathname === "/sw.js" ||
    /\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|webmanifest|txt|xml)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  const secret = getSecret();

  if (!token || !secret) {
    if (isPublicPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    await jwtVerify(token, secret);
    if (isPublicPage) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  } catch {
    if (isPublicPage) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/auth", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
