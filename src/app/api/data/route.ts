import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT data FROM app_data WHERE id = 1"
    ) as [Array<{ data: string }>, unknown];
    await conn.end();
    if (rows.length === 0) return NextResponse.json(null);
    return new NextResponse(rows[0].data, {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO app_data (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [body]
    );
    await conn.end();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
