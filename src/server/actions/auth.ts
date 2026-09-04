"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export type RegisterState = { error: string | null; success: boolean };

export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !lastName || !email || !password) {
    return { error: "Completa todos los campos.", success: false };
  }

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
    return { error: `Usa tu correo corporativo (@${allowedDomain}).`, success: false };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres.", success: false };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo.", success: false };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, lastName, email, passwordHash } });

  return { error: null, success: true };
}
