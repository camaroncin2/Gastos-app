import { NextResponse } from "next/server";

// TEMPORARY diagnostic — reports what env vars the runtime sees (no secret
// values, only presence/lengths/URL edges). Remove after debugging.
export async function GET() {
  const u = process.env.DB_PROXY_URL || "";
  const s = process.env.DB_PROXY_SECRET || "";
  const j = process.env.JWT_SECRET || "";
  return NextResponse.json({
    hasProxyUrl: !!process.env.DB_PROXY_URL,
    proxyUrlLen: u.length,
    proxyUrlHead: u.slice(0, 34),
    proxyUrlTail: JSON.stringify(u.slice(-8)),
    hasProxySecret: !!process.env.DB_PROXY_SECRET,
    proxySecretLen: s.length,
    hasJwt: !!process.env.JWT_SECRET,
    jwtLen: j.length,
  });
}
