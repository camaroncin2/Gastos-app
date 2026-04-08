import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isApiAuth = pathname.startsWith("/api/auth");

  // Always allow auth API routes
  if (isApiAuth) return NextResponse.next();

  const token = request.cookies.get("auth-token")?.value;
  const secret = getSecret();

  if (!token || !secret) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    if (isLoginPage) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  } catch {
    if (isLoginPage) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
