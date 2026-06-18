import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password, name, mode } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    if (mode === "register") {
      if (!name) {
        return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
      }
      // Check if user already exists
      const existing = await db.findUserByEmail(email);
      if (existing.length > 0) {
        return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
      }
      const hash = await bcrypt.hash(password, 12);
      const id = randomUUID();
      await db.createUser({ id, email, name, passwordHash: hash });

      const token = await signToken(id);
      const response = NextResponse.json({ ok: true, name });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    // Login mode
    const users = await db.findUserByEmail(email);
    if (users.length === 0) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }
    const user = users[0] as { id: string; name: string; password_hash: string };
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    const token = await signToken(user.id);
    const response = NextResponse.json({ ok: true, name: user.name });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
