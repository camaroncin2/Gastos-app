import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSession } from "@/lib/auth";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json(null, { status: 401 });

    const sql = getDb();
    const rows = await sql`SELECT data FROM app_data WHERE user_id = ${session.userId}`;
    if (rows.length === 0) return NextResponse.json(null);
    return new NextResponse(rows[0].data as string, {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false }, { status: 401 });

    const body = await request.text();
    const sql = getDb();
    await sql`
      INSERT INTO app_data (user_id, data) VALUES (${session.userId}, ${body})
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
