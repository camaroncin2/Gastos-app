import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.json(null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    fs.writeFileSync(DATA_FILE, body, "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
