import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// TEMPORARY diagnostic — remove after debugging.
export async function GET() {
  const u = process.env.DB_PROXY_URL || "";
  const s = process.env.DB_PROXY_SECRET || "";
  const env = {
    hasProxyUrl: !!process.env.DB_PROXY_URL,
    proxyUrlLen: u.length,
    proxyUrlTail: JSON.stringify(u.slice(-8)),
    hasProxySecret: !!process.env.DB_PROXY_SECRET,
    proxySecretLen: s.length,
    hasJwt: !!process.env.JWT_SECRET,
  };

  let dbTest: unknown;
  try {
    const r = await db.loginCheck("login:diagtest");
    dbTest = { ok: true, result: r };
  } catch (e) {
    const err = e as { message?: string; cause?: unknown; stack?: string };
    dbTest = {
      ok: false,
      message: String(err?.message ?? e),
      cause: err?.cause ? String((err.cause as { message?: string })?.message ?? err.cause) : undefined,
      stack: String(err?.stack ?? "").slice(0, 400),
    };
  }

  return NextResponse.json({ env, dbTest });
}
