import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva requeridas" },
        { status: 400 }
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const users = await db.getUserById(session.userId);
    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.updatePassword(session.userId, newHash);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
