import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT data FROM app_data WHERE id = 1`;
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
    const body = await request.text();
    const sql = getDb();
    await sql`
      INSERT INTO app_data (id, data) VALUES (1, ${body})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
