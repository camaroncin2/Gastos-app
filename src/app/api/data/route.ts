import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json(null, { status: 401 });

    const rows = await db.getData(session.userId);
    if (rows.length === 0) return NextResponse.json(null);
    return new NextResponse(rows[0].data as string, {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Could not reach the database — signal an error (NOT empty data) so the
    // client stays read-only instead of overwriting stored data with defaults.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false }, { status: 401 });

    const body = await request.text();
    await db.setData(session.userId, body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
