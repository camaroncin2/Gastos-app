import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { randomUUID } from "crypto";

// Used to keep login timing constant whether or not the email exists,
// so response time doesn't reveal which emails are registered.
const DUMMY_HASH = "$2b$12$hVtG0LYi7qK.PSjUfmET/.C8VU/YfQC9heDYbNrwhzn4/vHg01oXe";

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
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        );
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

    // Login mode — rate limited against brute force.
    const rlKey = `login:${String(email).toLowerCase()}`;
    const gate = await db.loginCheck(rlKey);
    if (!gate.allowed) {
      const mins = Math.max(1, Math.ceil(gate.retryAfterSec / 60));
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Probá de nuevo en ${mins} minuto${mins !== 1 ? "s" : ""}.` },
        { status: 429 }
      );
    }

    const users = await db.findUserByEmail(email);
    const user = users[0] as { id: string; name: string; password_hash: string } | undefined;
    // Always run a compare (dummy hash if the user doesn't exist) so timing
    // doesn't leak whether the email is registered.
    const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !valid) {
      await db.loginFail(rlKey);
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }
    await db.loginReset(rlKey);

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
